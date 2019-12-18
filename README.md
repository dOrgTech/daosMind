# @dorgtech/daoswiki

>_Prtcl resources: [Overview](https://github.com/uprtcl/spec/wiki), [Spec](https://github.com/uprtcl/spec), [Dev guide](https://github.com/uprtcl/js-uprtcl/wiki), [API reference](https://uprtcl.github.io/js-uprtcl/)

This daos wiki package is opinionated for alchemy, it allow us to load all the modules we need to run the wikis funcionality

## Dependencies

This module depends on `@uprtl/wikis`, `@uprtl/documents`, `@uprtl/evees`, `@uprtcl/micro-orchestrator`, `@uprtcl/cortex`, `@uprtl/lenses`, `@uprtl/common` and `@uprtcl/connections`. It also depends on a redux module to be present.

## Install

```bash
npm install @dorgtech/daoswiki
```

## Usage

Import the module, instantiate it with its appropiate configuration, and load it:

```ts
import { WikiContainer } from '@dorgtech/daoswiki';

new WikiContainer()
```
