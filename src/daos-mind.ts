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
export { ReactiveWiki } from './ReactiveWiki';

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

  private evees = new EveesModule([this.ethEvees]);

  private httpDocuments = new DocumentsHttp(this.c1host, this.httpConnection);
  private ipfsDocuments = new DocumentsIpfs(this.ipfsConnection);

  private documents = new DocumentsModule([this.ipfsDocuments]);

  private httpWikis = new WikisHttp(this.c1host, this.httpConnection);
  private ipfsWikis = new WikisIpfs(this.ipfsConnection);

  private wikis = new WikisModule([this.ipfsWikis]);
  private lenses = new LensesModule({
    'lens-selector': new LensSelectorPlugin(),
    actions: new ActionsPlugin()
  });

  private orchestrator = new MicroOrchestrator();

  async initializeMicroOrchestrator(dispatcher) {
    //dispatcher would be passed through any module (probably into access control module - not sure tho)
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
      // dispatcher can be used the following way
      const proposalValues = {
        dao: '0x94d52415f187f530a105a275e8f4e0d34630d9ea',
        type: 'SchemeRegistrarAdd',
        permissions: '0x' + (17).toString(16).padStart(8, '0'),
        value: 0, // amount of eth to send with the call
        tags: ['Amazing test', 'Test'],
        title: "I'm totally testing",
        description: 'Indeed, what a test',
        parametersHash: '0x00000000000000000000000000000000000000000',
        scheme: '0x99f5a5d38d6cd364f4b0489da549c3e2013a7e32',
        schemeToRegister: '0x9a543aef934c21da5814785e38f9a7892d3cde6e'
      };
      // dispatcher.createProposal(proposalValues)
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki);
    } catch (e) {
      console.log(e);
    }
  }

  constructor(dispatcher) {
    this.initializeMicroOrchestrator(dispatcher);
  }

  private static _instance: WikiContainer;

  public static getInstance(dispatcher) {
    return this._instance || (this._instance = new this(dispatcher));
  }
}
