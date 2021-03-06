import * as React from 'react';

interface IProps {
  history: any;
  location: any;
  match: any;
  wikiSchemeAddress: any;
  isActive: boolean;
}

export class ReactiveWiki extends React.Component<IProps, null> {
  private handlerRef: React.RefObject<HTMLInputElement> = React.createRef();

  componentDidMount() {
    const element = this.handlerRef.current as any;

    element!.getRootHash = rootHash => {
      const actualUrl = this.props.location.pathname;
      const newUrl = actualUrl.slice(-1) === '/' ? `${actualUrl}${rootHash}` : `${actualUrl}/${rootHash}`;
      return this.props.history.push(newUrl);
    };

    element!.setPageHash = page => {
      const { match, location } = this.props;
      const { daoAvatarAddress, perspectiveId, pageId } = match.params;
      const pageDefined = pageId ? true : false;
      const actualPage = page.detail.pageId;
      if (actualPage) {
        if (pageDefined) {
          const newUrl = `/dao/${daoAvatarAddress}/wiki/${perspectiveId}/${actualPage}`;
          return this.props.history.replace(newUrl);
        } else {
          const actualUrl = location.pathname;
          const newUrl = actualUrl.slice(-1) === '/' ? `${actualUrl}${actualPage}` : `${actualUrl}/${actualPage}`;
          return this.props.history.push(newUrl);
        }
      } else {
        const newUrl = `/dao/${daoAvatarAddress}/wiki/${perspectiveId}`;
        return this.props.history.replace(newUrl);
      }
    };

    element!.toSchemePage = () => {
      const { match, wikiSchemeAddress } = this.props;
      const { daoAvatarAddress } = match.params;
      const schemePage = `/dao/${daoAvatarAddress}/scheme/${wikiSchemeAddress}`;
      return this.props.history.replace(schemePage);
    };

    element!.validScheme = () => {
      return this.props.isActive;
    };
  }

  public render() {
    return (
      <module-container style={{flexGrow: '1', flexDirection: 'column', display: 'flex' }}>
        <simple-wiki ref={this.handlerRef} style={{flexGrow: '1', flexDirection: 'column', display: 'flex' }} />
      </module-container>
    );
  }
}
