export interface IWikiUpdateProposalParams {
  methodName: string;
  methodParams: Array<string | number>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'module-container': any;
      'simple-wiki': any;
    }
  }
}