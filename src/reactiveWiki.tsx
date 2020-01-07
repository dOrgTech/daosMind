import * as React from "react";

interface IProps {
  dao: any;
  history: any;
  location: any;
  match: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "module-container": any;
      "simple-wiki": any;
    }
  }
}

export class ReactiveWiki extends React.Component<IProps, null> {
  private handlerRef: React.RefObject<HTMLInputElement> = React.createRef();

  componentDidMount() {
    const element = this.handlerRef.current as any;
    element!.getRootHash = rootHash => {
      this.props.location['pathname'] = '/jaja'
      // this.props.match.params.perspectiveId = rootHash
    }
  }

  public render() {
    return (
      <module-container>
        <simple-wiki ref={this.handlerRef}/>
      </module-container>
    );
  }
}
