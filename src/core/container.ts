import { MicroOrchestrator, i18nextBaseModule } from '@uprtcl/micro-orchestrator';
import { LensesModule } from '@uprtcl/lenses';
import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';

import { CortexModule } from '@uprtcl/cortex';
import { AccessControlModule } from '@uprtcl/access-control';
import { EveesModule, EveesEthereum, EveesHttp } from '@uprtcl/evees';

import { HttpConnection } from '@uprtcl/http-provider';

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
  private ethConnection = new EthereumConnection({ provider: this.ethHost });
  
  private httpEvees = new EveesHttp(this.c1host, this.httpConnection, this.ethConnection, this.httpCidConfig);
  private ethEvees = new EveesEthereum(this.ethConnection, this.ipfsConfig, this.ipfsCidConfig);

  private evees = new EveesModule([this.ethEvees, this.httpEvees], this.httpEvees);
  private documents = new DocumentsModule();
  private wikis = new WikisModule();
  
  private orchestrator = new MicroOrchestrator();

  async initializeMicroOrchestrator(web3provider, dispatcher, hasHomeProposal) {
    const modules = [
      new i18nextBaseModule(),
      new ApolloClientModule(),
      new CortexModule(),
      new DiscoveryModule(),
      new LensesModule(),
      new AccessControlModule(),
      this.evees,
      this.documents,
      this.wikis
    ];

    try {
      await this.orchestrator.loadModules(modules);
      customElements.define('simple-wiki', SimpleWiki(web3provider, dispatcher, hasHomeProposal));
    } catch (e) {
      console.log(e);
    }
  }

  constructor(web3provider, dispatcher, hasHomeProposal) {
    this.initializeMicroOrchestrator(web3provider, dispatcher, hasHomeProposal);
  }

  private static _instance: WikiContainer;

  public static getInstance(web3provider, dispatcher, hasHomeProposal) {
    return this._instance || (this._instance = new this(web3provider, dispatcher, hasHomeProposal));
  }
}