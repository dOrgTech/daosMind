import * as React from 'react';

interface IProps {
  history: any;
  location: any;
  match: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'module-container': any;
      'simple-wiki': any;
    }
  }
}

export function ReactiveWiki(props: IProps) {
  const handlerRef: React.RefObject<HTMLInputElement> = React.createRef();

  React.useEffect(() => {
    const element = handlerRef.current as any;

    element!.getRootHash = rootHash => {
      const actualUrl = props.location.pathname;
      const newUrl = actualUrl.slice(-1) === '/' ? `${actualUrl}${rootHash}` : `${actualUrl}/${rootHash}`;
      return props.history.push(newUrl);
    };

    element!.setPageHash = page => {
      const { match, location } = props;
      const { daoAvatarAddress, perspectiveId, pageId } = match.params;
      const pageDefined = pageId ? true : false;
      const actualPage = page.detail.pageId;
      if (actualPage) {
        if (pageDefined) {
          const newUrl = `/dao/${daoAvatarAddress}/wiki/${perspectiveId}/${actualPage}`;
          return props.history.replace(newUrl);
        } else {
          const actualUrl = location.pathname;
          const newUrl = actualUrl.slice(-1) === '/' ? `${actualUrl}${actualPage}` : `${actualUrl}/${actualPage}`;
          return props.history.push(newUrl);
        }
      } else {
        const newUrl = `/dao/${daoAvatarAddress}/wiki/${perspectiveId}`;
        return props.history.replace(newUrl);
      }
    };
  });

  return (
    <module-container>
      <simple-wiki ref={handlerRef} />
    </module-container>
  );
}
