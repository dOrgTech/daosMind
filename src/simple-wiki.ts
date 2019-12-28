import { LitElement, html, property } from "lit-element";

import { moduleConnect } from "@uprtcl/micro-orchestrator";
import { EveesTypes } from "@uprtcl/evees";
import { WikisTypes } from "@uprtcl/wikis";

export let actualHash = {};

export class SimpleWiki extends moduleConnect(LitElement) {
  @property({ type: String })
  rootHash!: string | null;

  private wikiPattern: any = null;
  private perspectivePattern: any = null;
  private wikisProvider: any = null;
  private eveesProvider: any = null;

  addWikiHash() {
    const withSlash = () => window.history.pushState('', '', `${window.location.href}/${this.rootHash}`);
    const withoutSlash = () => window.history.pushState('', '', `${window.location.href}${this.rootHash}`);
    window.location.href.slice(-1) === '/' ? withoutSlash() : withSlash()
  }

  async firstUpdated() {
    this.perspectivePattern = this.requestAll(
      EveesTypes.PerspectivePattern
    ).find((p: any) => p.create);

    this.wikiPattern = this.requestAll(WikisTypes.WikiEntity).find(
      (p: any) => p.create
    );

    this.wikisProvider = this.requestAll(WikisTypes.WikisRemote).find(
      (provider: any) => {
        const regexp = new RegExp("^http");
        return regexp.test(provider.uprtclProviderLocator);
      }
    );

    this.eveesProvider = this.requestAll(EveesTypes.EveesRemote).find(
      (provider: any) => {
        const regexp = new RegExp("^http");
        return regexp.test(provider.uprtclProviderLocator);
      }
    );

    //retrieving information from smart contract - we are mocking it right now with localstorage
    if (localStorage.getItem(actualHash['dao'])) {
      this.rootHash = localStorage.getItem(actualHash['dao'])
    }

    // checking if there is wiki hash in the url
    if (actualHash["wiki"]) {
      this.rootHash = actualHash["wiki"]
    }

    //create new wiki and associate it with dao address
    if (!this.rootHash) {
      const wiki = await this.wikiPattern.create()(
        { title: "First wiki on alchemy :-)" },
        this.wikisProvider.uprtclProviderLocator
      );
      const perspective = await this.perspectivePattern.create()(
        { dataId: wiki.id },
        this.eveesProvider.uprtclProviderLocator
      );

      this.rootHash = perspective.id;
      localStorage.setItem(actualHash['dao'], perspective.id);
    }

    //adding wiki's hash into the url
    if (!actualHash['wiki']) {
      this.addWikiHash()
    }
  }

  render() {
    return html`
      ${this.rootHash
        ? html`
            <cortex-entity
              .hash=${this.rootHash}
              lens="content"
            ></cortex-entity>
          `
        : html`
            Loading...
          `}
    `;
  }
}
