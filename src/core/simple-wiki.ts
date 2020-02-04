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
import { IWikiUpdateProposalParams } from '../types';
import { DocumentsModule, DocumentsRemote } from '@uprtcl/documents';

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

    setupProposalListener() {
      this.addEventListener('evees-create-proposal', e => {
        const proposalValues: IWikiUpdateProposalParams = {
          methodName: 'setHomePerspective',
          methodParams: ['0x29', '0x29']
        };
        dispatcher.createProposal(proposalValues);
      });
    }

    async firstUpdated() {
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
          const result = await client.mutate({
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
              dataId: result.data.createWiki.id,
              parentsIds: [],
              source: eveesProvider.source
            }
          });

          const createPerspective = await client.mutate({
            mutation: CREATE_PERSPECTIVE,
            variables: {
              headId: createCommit.data.createCommit.id,
              authority: eveesProvider.authority
            }
          });

          this.rootHash = createPerspective.data.createPerspective.id;

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
    }

    render() {
      return html`
        ${this.rootHash
          ? html`
              <wiki-drawer
                wiki-id="${this.rootHash}"
                @page-selected=${hash => this.setPageHash(hash)}
                current-page="${this.selectedPage}"
              ></wiki-drawer>
            `
          : html`
              Loading...
            `}
      `;
    }
  }
  return DaoWiki;
}
