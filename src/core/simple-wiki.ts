import { LitElement, html, property, css } from 'lit-element';

import { ApolloClient } from 'apollo-boost';
import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesModule, EveesHelpers } from '@uprtcl/evees';
import { WikisModule } from '@uprtcl/wikis';
import { ApolloClientModule } from '@uprtcl/graphql';

import { IWikiUpdateProposalParams } from '../types';
import { checkHome } from '../web3';

export let actualHash = {};

export function SimpleWiki(web3Provider, dispatcher, hasHomeProposal): any {
  class DaoWiki extends moduleConnect(LitElement) {
    @property({ type: String })
    rootHash!: string;

    @property({ type: Function })
    getRootHash!: Function;

    @property({ type: Function })
    setPageHash!: Function;

    @property({ type: Function })
    toSchemePage!: Function;

    @property({ type: String })
    selectedPage!: string;

    @property({ type: Function })
    validScheme!: Function;

    @property({ attribute: false })
    loading: boolean;

    @property({ attribute: false })
    hasHome: boolean = false;

    @property({ attribute: false })
    defaultAuthority!: string;

    static get styles() {
      return css`
        wiki-drawer {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .container {
          padding: 50px;
          text-align: center;
          margin-top: 80px;
        }

        .header {
          font-size: 16px;
          position: relative;
          text-align: center;
          padding-top: 20px;
          padding-bottom: 20px;
          border-top: $gray-border-2;
          color: $gray-1;
          font-weight: $bold;
        }

        a {
          color: rgba(6, 118, 255, 1);
          font-size: 11px;
          font-family: 'Open Sans';
          display: inline-block;
          margin-right: 20px;
        }

        a.blueButton {
          height: 30px;
          line-height: 30px;
          font-size: 13px;
          color: white;
          background-color: rgba(5, 118, 255, 1);
          transition: all 0.25s ease;
          border-radius: 15px;
          display: inline-block;
          padding: 0 30px;

          &:hover {
            background-color: rgba(19, 46, 91, 1);
            color: $white;
          }

          &.disabled,
          &disabled:hover {
            background-color: rgba(200, 200, 200, 0.5);
            border: 1px solid rgba(200, 200, 200, 1);
            cursor: not-allowed;
          }
        }
      `;
    }

    constructor() {
      super();
      this.loading = true;
    }

    WikiPage = () =>
      !this.loading
        ? html`
            <wiki-drawer
              ref=${this.rootHash}
              default-authority=${this.defaultAuthority}
            ></wiki-drawer>
          `
        : html` Loading... `;

    CheckShemeIsValid = () =>
      this.validScheme()
        ? this.WikiPage()
        : html` <h2>Voting machine is wrong. Please try again later</h2> `;

    CreateHome = () => {
      return html`
        <div class="container">
          <div class="header">Initialize your wiki now</div>
          <a
            href="javascript:void(0)"
            class="blueButton"
            @click="${this.createHome}"
          >
            Set home
          </a>
        </div>
      `;
    };

    async createHome() {
      //create new wiki and associate it with dao address
      if (!this.rootHash) {
        const eveesEthProvider: any = this.requestAll(
          EveesModule.bindings.EveesRemote
        ).find((provider: any) => provider.authority.startsWith('eth'));

        try {
          const client: ApolloClient<any> = this.request(
            ApolloClientModule.bindings.Client
          ) as ApolloClient<any>;

          const wiki = {
            title: 'Genesis Wiki',
            pages: [],
          };

          const dataId = await EveesHelpers.createEntity(
            client,
            eveesEthProvider,
            wiki
          );
          const headId = await EveesHelpers.createCommit(
            client,
            eveesEthProvider,
            { dataId }
          );

          const randint = 0 + Math.floor((10000 - 0) * Math.random());
          const perspectiveId = await EveesHelpers.createPerspective(
            client,
            eveesEthProvider,
            {
              headId,
              context: `genesis-dao-wiki-${randint}`,
              canWrite: actualHash['dao'],
            }
          );

          this.rootHash = perspectiveId;

          if (this.rootHash) {
            if (hasHomeProposal) {
              return this.toSchemePage();
            } else {
              const proposalValues: IWikiUpdateProposalParams = {
                methodName: 'setHomePerspective',
                methodParams: [this.rootHash],
              };
              await dispatcher.createProposal(proposalValues);
              return this.toSchemePage();
            }

            // localStorage.setItem(actualHash['dao'], this.rootHash);
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (!actualHash['wiki']) {
        this.getRootHash(this.rootHash);
        this.hasHome = true;
      }

      this.loading = false;
    }

    async firstUpdated() {
      this.addEventListener('evees-proposal-created', async (e: any) => {
        const proposalValues: IWikiUpdateProposalParams = {
          methodName: 'authorizeProposal',
          methodParams: [e.detail.proposalId, '1', true],
        };
        await dispatcher.createProposal(proposalValues);
      });

      // const homePerspective = localStorage.getItem(actualHash['dao']);
      const homePerspective = await checkHome(web3Provider, actualHash['dao']);
      console.log({ homePerspective });

      if (homePerspective) {
        this.hasHome = true;
        const eveesHttpProvider: any = this.requestAll(
          EveesModule.bindings.EveesRemote
        ).find((provider: any) => provider.authority.startsWith('http'));

        await eveesHttpProvider.connect();
        this.defaultAuthority = eveesHttpProvider.authority;

        this.rootHash = homePerspective;
        this.loading = false;
      } else {
        this.hasHome = false;
      }

      // checking if there is wiki hash in the url
      if (actualHash['wiki']) {
        this.rootHash = actualHash['wiki'];
        // checking if there is a page selected
        if (actualHash['page']) {
          this.selectedPage = actualHash['page'];
        }
      }
    }

    render() {
      return this.hasHome ? this.CheckShemeIsValid() : this.CreateHome();
    }
  }
  return DaoWiki;
}
