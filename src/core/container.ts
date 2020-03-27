import { MicroOrchestrator, i18nextBaseModule } from '@uprtcl/micro-orchestrator';
import { LensesModule, LensSelectorPlugin, ActionsPlugin } from '@uprtcl/lenses';
import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';

import { CortexModule } from '@uprtcl/cortex';
import { AccessControlModule } from '@uprtcl/access-control';
import { EveesModule, EveesEthereum, EveesHttp } from '@uprtcl/evees';

import { IpfsConnection, IpfsStore } from '@uprtcl/ipfs-provider';
import { HttpConnection, HttpStore } from '@uprtcl/http-provider';

import { EthereumConnection } from '@uprtcl/ethereum-provider';

import { ApolloClientModule } from '@uprtcl/graphql';
import { DiscoveryModule } from '@uprtcl/multiplatform';


import { SimpleWiki } from './simple-wiki';

type version = 1 | 0
export class WikiContainer {
  private c1host = 'http://localhost:3100/uprtcl/1';
  private ethHost = '';
  private ipfsConfig = {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  };

  private httpCidConfig = { version: 1 as version, type: 'sha3-256', codec: 'raw', base: 'base58btc' };
  private ipfsCidConfig = { version: 1 as version, type: 'sha2-256', codec: 'raw', base: 'base58btc' };

  private httpConnection = new HttpConnection(null as any, {});
  private ipfsConnection = new IpfsConnection(this.ipfsConfig);
  private ethConnection = new EthereumConnection(
    { provider: this.ethHost },
    {}
  );

  
  private httpEvees = new EveesHttp(this.c1host, this.httpConnection, this.ethConnection, this.httpCidConfig);
  private ethEvees = new EveesEthereum(this.ethConnection, this.ipfsConnection, this.ipfsCidConfig);

  private ipfsStore = new IpfsStore(this.ipfsConnection, this.ipfsCidConfig);
  private httpStore = new HttpStore(this.c1host, this.httpConnection, this.httpCidConfig);
  
  private remoteMap = eveesAuthority => {
    if (eveesAuthority === this.ethEvees.authority) {
      return this.ipfsStore;
    } else {
      return this.httpStore;
    }
  };
  
  private remotesConfig = {
    map: this.remoteMap,
    defaultCreator: this.httpEvees
  }
  
  private evees = new EveesModule([this.ethEvees, this.httpEvees], this.remotesConfig);
  private documents = new DocumentsModule([this.ipfsStore, this.httpStore]);
  private wikis = new WikisModule([this.ipfsStore, this.httpStore]);
  
  private lenses = new LensesModule({
    'lens-selector': new LensSelectorPlugin(),
    actions: new ActionsPlugin()
  });

  private orchestrator = new MicroOrchestrator();

  async initializeMicroOrchestrator(web3provider, dispatcher) {
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
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki(web3provider, dispatcher));
    } catch (e) {
      console.log(e);
    }
  }

  constructor(web3provider, dispatcher) {
    this.initializeMicroOrchestrator(web3provider, dispatcher);
  }

  private static _instance: WikiContainer;

  public static getInstance(web3provider, dispatcher) {
    return this._instance || (this._instance = new this(web3provider, dispatcher));
  }
}