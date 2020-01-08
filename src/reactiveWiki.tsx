import * as React from "react";
import { Redirect } from "react-router-dom";

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
      const actualUrl = this.props.location.pathname
      const newUrl = actualUrl.slice(-1) === '/' ? `${actualUrl}${rootHash}` : `${actualUrl}/${rootHash}`
      return this.props.history.push(newUrl);
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
