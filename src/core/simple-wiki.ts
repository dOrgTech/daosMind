import { LitElement, html, property } from 'lit-element';

import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesBindings } from '@uprtcl/evees';
import { WikisModule, WikiBindings } from '@uprtcl/wikis';

import { IWikiUpdateProposalParams } from '../types';

export let actualHash = {};

export function SimpleWiki(dispatcher): any {
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
          methodParams: [e.details.proposalId, '1']
        };
        await dispatcher.createProposal(proposalValues);
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

      const eveesHttpProvider: any = this.requestAll(
        EveesModule.bindings.EveesRemote
      ).find((provider: any) => provider.authority.startsWith('http'));

      await eveesHttpProvider.login();

      //create new wiki and associate it with dao address
      if (!this.rootHash) {
        const wikisProvider: any = this.requestAll(
          WikisModule.bindings.WikisRemote
        ).find((provider: any) => provider.source.startsWith('ipfs'));
        const eveesEthProvider: any = this.requestAll(
          EveesModule.bindings.EveesRemote
        ).find((provider: any) => provider.authority.startsWith('eth'));

        try {
          const wikipatterns = this.requestAll(WikiBindings.WikiEntity);
          const wikicreatable: any = wikipatterns.find((p: any) => p.create);
          const wiki: any = await wikicreatable.create()(
            {
              title: 'Genesis Wiki',
              pages: []
            },
            wikisProvider.source
          );

          const commitpatterns = this.requestAll(EveesBindings.CommitPattern);
          const commitcreatable: any = commitpatterns.find(
            (p: any) => p.create
          );
          const commit: any = await commitcreatable.create()(
            {
              dataId: wiki.id,
              parentsIds: [],
              message: 'create'
            },
            eveesEthProvider.source
          );

          const randint = 0 + Math.floor((10000 - 0) * Math.random());

          const perspectivepatterns = this.requestAll(
            EveesBindings.PerspectivePattern
          );
          const perspectivecreatable: any = perspectivepatterns.find(
            (p: any) => p.create
          );
          const perspective = await perspectivecreatable.create()(
            {
              fromDetails: {
                headId: commit.id,
                context: `genesis-dao-wiki-${randint}`,
                name: 'common'
              },
              canWrite: actualHash['dao']
            },
            eveesEthProvider.authority
          );

          this.rootHash = perspective.id;

          if (this.rootHash) {
            // const proposalValues: IWikiUpdateProposalParams = {
            //   methodName: 'setHomePerspective',
            //   methodParams: [this.rootHash, actualHash['dao']]
            // };
            // await dispatcher.createProposal(proposalValues);
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
