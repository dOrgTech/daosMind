import { LitElement, html, property } from 'lit-element';

import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { ApolloClientModule } from '@uprtcl/common';
import { CREATE_COMMIT, CREATE_PERSPECTIVE } from '@uprtcl/evees';
import { CREATE_WIKI } from '@uprtcl/wikis';
import { ApolloClient } from 'apollo-boost';

export let actualHash = {};

export class SimpleWiki extends moduleConnect(LitElement) {
  @property({ type: String })
  rootHash!: string | null;

  @property({ type: Function })
  getRootHash!: Function;

  async firstUpdated() {
    if (localStorage.getItem(actualHash['dao'])) {
      const dao = localStorage.getItem(actualHash['dao']);
      this.rootHash = dao;
    }

    // checking if there is wiki hash in the url
    if (actualHash['wiki']) {
      this.rootHash = actualHash['wiki']
    }

    //create new wiki and associate it with dao address
    if (!this.rootHash) {
      try {
        const client: ApolloClient<any> = this.request(ApolloClientModule.types.Client);
        const result = await client.mutate({
          mutation: CREATE_WIKI,
          variables: {
            content: {
              title: 'Genesis Wiki',
              pages: []
            }
          }
        });

        const createCommit = await client.mutate({
          mutation: CREATE_COMMIT,
          variables: {
            dataId: result.data.createWiki.id,
            parentsIds: []
          }
        });

        const createPerspective = await client.mutate({
          mutation: CREATE_PERSPECTIVE,
          variables: {
            headId: createCommit.data.createCommit.id
          }
        });

        this.rootHash = createPerspective.data.createPerspective.id

        if (this.rootHash) {
          localStorage.setItem(actualHash['dao'], this.rootHash!);
        }
      } catch (e) {
        console.log(e);
      } 
      if (!actualHash['wiki']) {
        this.getRootHash(this.rootHash)
      }
  
      console.log(this.rootHash);
    }
  }

  render() {
    return html`
      ${this.rootHash
        ? html`
            <wiki-drawer
              wiki-id="${this.rootHash}"
              @page-selected=${() =>
                console.log('TODO: handle page-selected here')}
            ></wiki-drawer>
          `
        : html`
            Loading...
          `}
    `;
  }
}
