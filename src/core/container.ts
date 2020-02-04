import { MicroOrchestrator, i18nextBaseModule } from '@uprtcl/micro-orchestrator';
import { LensesModule, LensSelectorPlugin, ActionsPlugin } from '@uprtcl/lenses';
import { DocumentsHttp, DocumentsIpfs, DocumentsModule } from '@uprtcl/documents';
import { WikisIpfs, WikisModule, WikisHttp } from '@uprtcl/wikis';
import { CortexModule } from '@uprtcl/cortex';
import { AccessControlModule } from '@uprtcl/access-control';
import { EveesModule, EveesEthereum, EveesHttp } from '@uprtcl/evees';
import { IpfsConnection } from '@uprtcl/ipfs-provider';
import { EthereumConnection } from '@uprtcl/ethereum-provider';
import { HttpConnection } from '@uprtcl/http-provider';
import { ApolloClientModule } from '@uprtcl/graphql';
import { DiscoveryModule } from '@uprtcl/multiplatform';

import { SimpleWiki } from './simple-wiki';

export class WikiContainer {
  private c1host = 'http://localhost:3100/uprtcl/1';
  private ethHost = '';
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
  
  private lenses = new LensesModule({
    'lens-selector': new LensSelectorPlugin(),
    actions: new ActionsPlugin()
  });
  
  private httpEvees = new EveesHttp(this.c1host, this.httpConnection, this.ethConnection);
  private ethEvees = new EveesEthereum(this.ethConnection, this.ipfsConnection);
  
  private httpDocuments = new DocumentsHttp(this.c1host, this.httpConnection);
  private ipfsDocuments = new DocumentsIpfs(this.ipfsConnection);
  
  private httpWikis = new WikisHttp(this.c1host, this.httpConnection);
  private ipfsWikis = new WikisIpfs(this.ipfsConnection);
  
  private remoteMap = (eveesAuthority, entityName) => {
    if (eveesAuthority === this.ethEvees.authority) {
      if (entityName === 'Wiki') return this.ipfsWikis;
      else if (entityName === 'TextNode') return this.ipfsDocuments;
    } else {
      if (entityName === 'Wiki') return this.httpWikis;
      else if (entityName === 'TextNode') return this.httpDocuments;
    }
  };
  
  private remotesConfig = {
    map: this.remoteMap,
    defaultCreator: this.httpEvees
  }
  
  private evees = new EveesModule([this.ethEvees, this.httpEvees], this.remotesConfig);
  private documents = new DocumentsModule([this.ipfsDocuments, this.httpDocuments]);
  private wikis = new WikisModule([this.ipfsWikis, this.httpWikis]);
  
  private orchestrator = new MicroOrchestrator();
  
  async initializeMicroOrchestrator(dispatcher) {
    //dispatcher would be passed through any module (probably into access control module - not sure tho)
    const modules = [
      new i18nextBaseModule(),
      new ApolloClientModule(),
      new CortexModule(),
      new DiscoveryModule(),
      this.lenses,
      new AccessControlModule(),
      this.evees,
      this.documents,
      this.wikis
    ];

    try {
      /*  
      create a proposal in wiki update generic scheme

      this is just mocked data - the real params are going to be 
      handled through the wiki component (the callData will be encoded after being sent to the dispatcher)
      
      const proposalValues: IWikiUpdateProposalParams = {
        methodName: 'setHomePerspective',
        methodParams: ['0x29', '0x29']
      };
      dispatcher.createProposal(proposalValues)
      
      vote a in a proposal of wiki update generic scheme
      const voteValues = {
        // this proposal has to be retrieved frmo the wiki's ui
        proposalId: '0x548a1d23051352b33b1f9589e920f1c2640b81d5d5991a7912fbb4365014a2c0',
        voteOption: 1
      }
      dispatcher.voteOnProposal(voteValues)
      */
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki(dispatcher));
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
