export interface IWikiUpdateProposalParams {
  title: string;
  description: string;
  tags?: string[];
  methodName: string;
  methodParams: Array<string | number>;
  dao: string;
  scheme: string;
  type: 'GenericScheme',
  value: 0, // amount of eth to send with the call
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'module-container': any;
      'simple-wiki': any;
    }
  }
}