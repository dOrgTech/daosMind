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
import { IWikiUpdateProposalParams } from '../types'

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

/*  
      this is going to be the one that we are going to use,
      it's to create a proposal in wiki update generic scheme

      this is just mocked data - the real params are going to be 
      handled through the wiki component (the callData will be encoded after being sent to the dispatcher)
*/

      const proposalValues: IWikiUpdateProposalParams = {
        // dao and scheme address will be retrieved from reactive wiki
        dao: '0xac48330d4b96fc74c76ec2ac33a877e9638c1baf',
        scheme: '0xc03170b6650e0e1f1b8cfae4ac12c74a317b58ec',
        type: 'GenericScheme',
        value: 0, // amount of eth to send with the call
        tags: ['Amazing test on generic scheme', 'Test'],
        title: "I'm totally testing but now on generic scheme :-)",
        description: 'Indeed, what a test',
        methodName: 'setHomePerspective',
        methodParams: ['0x29', '0x29']
      };

/* 
      this is just a test make sure that dispatcher works - this is to registrer a scheme,
      wont work on wiki because we want to create proposals on generic schemes
      which has different params
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
*/      
      dispatcher.createProposal(proposalValues)

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
