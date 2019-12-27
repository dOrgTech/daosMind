import { LitElement, html, property } from "lit-element";

import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesTypes } from '@uprtcl/evees';
import { WikisTypes } from '@uprtcl/wikis';

export class SimpleWiki extends moduleConnect(LitElement) {
  @property({ type: String })
  rootHash!: string;

  private wikiPattern: any = null;
  private perspectivePattern: any = null;
  private wikisProvider: any = null;
  private eveesProvider: any = null;

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
      console.log(this.rootHash)
    }
  }

  render() {
    return html`
      ${this.rootHash
        ? html`
            <cortex-entity .hash=${this.rootHash} lens="content"></cortex-entity>
          `
        : html`
            Loading...
          `}
    `;
  }
}
