import {
  MicroOrchestrator,
  i18nTypes
} from '@uprtcl/micro-orchestrator';
import {
  CortexTypes,
  discoveryModule,
  DiscoveryTypes,
  LensesTypes,
  CortexModule
} from '@uprtcl/cortex';
import { lensesModule, LensSelectorPlugin, ActionsPlugin, UpdatablePlugin } from '@uprtcl/lenses';
import { DocumentsHttp, DocumentsIpfs, documentsModule, DocumentsTypes } from '@uprtcl/documents';
import { WikisIpfs, wikisModule, WikisTypes, WikisHttp } from '@uprtcl/wikis';
import {
  ApolloClientModule,
  GraphQlTypes,
  i18nextBaseModule,
  AccessControlTypes,
  AccessControlModule
} from '@uprtcl/common';
import { eveesModule, EveesEthereum, EveesHttp, EveesTypes } from '@uprtcl/evees';
import {
  IpfsConnection,
  EthereumConnection,
  HttpConnection
} from '@uprtcl/connections';
import { SimpleWiki } from './simple-wiki';

export class WikiContainer {
  private c1host = 'http://localhost:3100/uprtcl/1';
  private ethHost = 'ws://localhost:8545';
  private ipfsConfig = { host: 'ipfs.infura.io', port: 5001, protocol: 'https' };

  private httpConnection = new HttpConnection(null as any, {});

  private ipfsConnection = new IpfsConnection(this.ipfsConfig);
  private ethConnection = new EthereumConnection({ provider: this.ethHost }, {});

  private httpEvees = new EveesHttp(this.c1host, this.httpConnection);
  private ethEvees = new EveesEthereum(this.ethConnection, this.ipfsConnection);

  private evees = eveesModule([this.httpEvees, this.ethEvees]);
  
  private httpDocuments = new DocumentsHttp(this.c1host, this.httpConnection);
  private ipfsDocuments = new DocumentsIpfs(this.ipfsConnection);

  private documents = documentsModule([this.ipfsDocuments, this.httpDocuments]);

  private httpWikis = new WikisHttp(this.c1host, this.httpConnection);
  private ipfsWikis = new WikisIpfs(this.ipfsConnection);

  private wikis = wikisModule([this.ipfsWikis, this.httpWikis]);
  private lenses = lensesModule([
    { name: 'lens-selector', plugin: new LensSelectorPlugin() },
    { name: 'actions', plugin: new ActionsPlugin() },
    { name: 'updatable', plugin: new UpdatablePlugin() }
  ]);
  
  private orchestrator = new MicroOrchestrator();
  async initializeMicroOrchestrator(store) {
    try {
      const modules = {
        [i18nTypes.Module]: i18nextBaseModule,
        [GraphQlTypes.Module]: ApolloClientModule,
        [CortexTypes.Module]: CortexModule,
        //aqui pasamos store
        [DiscoveryTypes.Module]: discoveryModule(),
        [LensesTypes.Module]: this.lenses,
        [AccessControlTypes.Module]: AccessControlModule,
        [EveesTypes.Module]: this.evees,
        [DocumentsTypes.Module]: this.documents,
        [WikisTypes.Module]: this.wikis
      };
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki);
    } catch (e) {
      console.log(e)
    }
  }

  constructor(store) {
    this.initializeMicroOrchestrator(store);
  }

  private static _instance: WikiContainer;

  public static getInstance(store) {
    return this._instance || (this._instance = new this(store));
  }
}
