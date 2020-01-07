import {
  MicroOrchestrator,
  i18nextBaseModule
} from '@uprtcl/micro-orchestrator';
import {
  LensesModule,
  LensSelectorPlugin,
  ActionsPlugin
} from '@uprtcl/lenses';
import {
  DocumentsHttp,
  DocumentsIpfs,
  DocumentsModule
} from '@uprtcl/documents';
import { WikisIpfs, WikisModule, WikisHttp } from '@uprtcl/wikis';
import {
  ApolloClientModule,
  GqlCortexModule,
  GqlDiscoveryModule
} from '@uprtcl/common';
import { AccessControlModule } from '@uprtcl/access-control';
import { EveesModule, EveesEthereum, EveesHttp } from '@uprtcl/evees';
import {
  IpfsConnection,
  EthereumConnection,
  HttpConnection
} from '@uprtcl/connections';

import { SimpleWiki } from './simple-wiki';

export { actualHash } from './simple-wiki';

export class WikiContainer {
  private c1host = 'http://localhost:3100/uprtcl/1';
  private ethHost = 'ws://localhost:8545';
  private ipfsConfig = {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  };

  private httpConnection = new HttpConnection(null as any, {});

  private ipfsConnection = new IpfsConnection(this.ipfsConfig);
  private ethConnection = new EthereumConnection(
    { provider: this.ethHost },
    {}
  );

  private httpEvees = new EveesHttp(this.c1host, this.httpConnection);
  private ethEvees = new EveesEthereum(this.ethConnection, this.ipfsConnection);

  private evees = new EveesModule([ this.ethEvees]);

  private httpDocuments = new DocumentsHttp(this.c1host, this.httpConnection);
  private ipfsDocuments = new DocumentsIpfs(this.ipfsConnection);

  private documents = new DocumentsModule([
    this.ipfsDocuments
  ]);

  private httpWikis = new WikisHttp(this.c1host, this.httpConnection);
  private ipfsWikis = new WikisIpfs(this.ipfsConnection);

  private wikis = new WikisModule([this.ipfsWikis]);
  private lenses = new LensesModule({
    'lens-selector': new LensSelectorPlugin(),
    actions: new ActionsPlugin()
  });

  private orchestrator = new MicroOrchestrator();
  async initializeMicroOrchestrator(store) {
    const modules = [
      new i18nextBaseModule(),
      new ApolloClientModule(),
      new GqlCortexModule(),
      new GqlDiscoveryModule(),
      this.lenses,
      new AccessControlModule(),
      this.evees,
      this.documents,
      this.wikis
    ];
    try {
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki);
    } catch (e) {
      console.log(e);
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
