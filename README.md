# @dorgtech/daoswiki

>_Prtcl resources: [Overview](https://github.com/uprtcl/spec/wiki), [Spec](https://github.com/uprtcl/spec), [Dev guide](https://github.com/uprtcl/js-uprtcl/wiki), [API reference](https://uprtcl.github.io/js-uprtcl/)

This daos mind package is opinionated for alchemy, it allow us to load all the modules we need to run the wikis funcionality

## Dependencies

This module depends on `@uprtl/wikis`, `@uprtl/documents`, `@uprtl/evees`, `@uprtcl/micro-orchestrator`, `@uprtcl/cortex`, `@uprtl/lenses`, `@uprtl/common` and `@uprtcl/connections`. It also depends on a redux module to be present.

## Install

```bash
npm install @dorgtech/daoswiki
```

## Usage

Import the module and call the `.getInstance` method, this class is a singleton to make sure it is instanciated just once:

```ts
import { WikiContainer } from '@dorgtech/daosmind';
/* 
  The dispatcher is a class on alchemy that allow us to access alchemy actions, so they can be triggered from uprtcl components
*/
const dispatcher = new CustomDispatcher(wikiMethods, daoInformation)
WikiContainer.getInstance(dispatcher)
```