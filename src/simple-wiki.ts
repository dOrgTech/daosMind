import { LitElement, html, property } from 'lit-element';
import { moduleConnect } from "@uprtcl/micro-orchestrator";

import { EveesTypes } from '@uprtcl/evees';
import { WikisTypes } from '@uprtcl/wikis';

export class SimpleWiki extends moduleConnect(LitElement) {
  @property({ type: String })
  rootHash: string = 'zb2rhiAnMfJ4XzHi3atdWwPTUZQFEfZeKvhJy9oGmSHkz3X5K'

  // private wikiPattern = this.requestAll(WikisTypes.WikiEntity).find((p: any) => p.create);
  // private perspectivePattern = this.requestAll(EveesTypes.PerspectivePattern).find((p: any) => p.create)
  // private wikisProvider: any = null;
  // private eveesProvider: any = null;
  constructor() {
    super();
    // this.wikisProvider = this.requestAll(WikisTypes.WikisRemote)
    // .find((provider: any) => {
    //   const regexp = new RegExp('^http');
    //   return regexp.test(provider.uprtclProviderLocator);
    // });
  
    // this.eveesProvider = this.requestAll(EveesTypes.EveesRemote)
    // .find((provider: any) => {
    //   const regexp = new RegExp('^http');
    //   return regexp.test(provider.uprtclProviderLocator);
    // });

  }

  render() {
    return html`
      ${this.rootHash
        ? html`
            <cortex-entity .hash=${this.rootHash}></cortex-entity>
          `
        : html`
            Loading...
          `}
    `;
  }
  
}