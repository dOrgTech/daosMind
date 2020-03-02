import { LitElement, html, property } from 'lit-element';

import { moduleConnect, Constructor } from '@uprtcl/micro-orchestrator';
import { ApolloClientModule } from '@uprtcl/graphql';
import {
  CREATE_COMMIT,
  CREATE_PERSPECTIVE,
  EveesModule,
  EveesRemote
} from '@uprtcl/evees';
import { CREATE_WIKI, WikisModule, WikisProvider } from '@uprtcl/wikis';
import { ApolloClient } from 'apollo-boost';
import { DocumentsModule, DocumentsRemote } from '@uprtcl/documents';
import { CHANGE_OWNER } from '@uprtcl/access-control';

import { IWikiUpdateProposalParams } from '../types';

export let actualHash = {};

export function SimpleWiki(dispatcher): Constructor<HTMLElement> {
  class DaoWiki extends moduleConnect(LitElement) {
    @property({ type: String })
    rootHash!: string | null;

    @property({ type: Function })
    getRootHash!: Function;

    @property({ type: Function })
    setPageHash!: Function;

    @property({ type: String })
    selectedPage!: string;

    @property({ type: Boolean, attribute: false })
    loading: boolean;

    constructor() {
      super();
      this.loading = true;
    }
    
    async firstUpdated() {
      this.addEventListener('evees-proposal-created', async (e: any) => {
        const proposalValues: IWikiUpdateProposalParams = {
          methodName: 'setRequestAuthorized',
          methodParams: [e.detail.proposalId, '1']
        };
        return await dispatcher.createProposal(proposalValues);
      });
      if (localStorage.getItem(actualHash['dao'])) {
        const dao = localStorage.getItem(actualHash['dao']);
        this.rootHash = dao;
      }

      // checking if there is wiki hash in the url
      if (actualHash['wiki']) {
        this.rootHash = actualHash['wiki'];
        // checking if there is a page selected
        if (actualHash['page']) {
          this.selectedPage = actualHash['page'];
        }
      }

      //create new wiki and associate it with dao address
      if (!this.rootHash) {
        const wikisProvider: WikisProvider = this.requestAll(
          WikisModule.bindings.WikisRemote
        ).find((provider: WikisProvider) =>  provider.source.startsWith('ipfs'));
        const eveesProvider: EveesRemote = this.requestAll(
          EveesModule.bindings.EveesRemote
        ).find((provider: EveesRemote) =>  provider.source.startsWith('ipfs'));
        
        this.requestAll(DocumentsModule.bindings.DocumentsRemote).find((provider: DocumentsRemote) => provider.source.startsWith('ipfs'));

        try {
          const client: ApolloClient<any> = this.request(
            ApolloClientModule.bindings.Client
          );
          const createWiki = await client.mutate({
            mutation: CREATE_WIKI,
            variables: {
              content: {
                title: 'Genesis Wiki',
                pages: []
              },
              source: wikisProvider.source
            }
          });

          const createCommit = await client.mutate({
            mutation: CREATE_COMMIT,
            variables: {
              dataId: createWiki.data.createWiki.id,
              parentsIds: [],
              source: eveesProvider.source
            }
          });

          const createPerspective = await client.mutate({
            mutation: CREATE_PERSPECTIVE,
            variables: {
              headId: createCommit.data.createCommit.id,
              authority: eveesProvider.authority,
              name: 'master'
            }
          });

          const perspectiveId = createPerspective.data.createPerspective.id;

          await client.mutate({
            mutation: CHANGE_OWNER,
            variables: {
              entityId: perspectiveId,
              newOwner: actualHash['dao']
            }
          });

          this.rootHash = perspectiveId;

          if (this.rootHash) {
            localStorage.setItem(actualHash['dao'], this.rootHash);
          }
        } catch (e) {
          console.log(e);
        }

        console.log(this.rootHash);
      }
      if (!actualHash['wiki']) {
        this.getRootHash(this.rootHash);
      }
      
      this.loading = false;
    }

    render() {
      return html`
        ${!this.loading
          ? html`
              <cortex-entity hash=${this.rootHash}></cortex-entity>
            `
          : html`
              Loading...
            `}
      `;
    }
  }
  return DaoWiki;
}
