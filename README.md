# Element UI

This is a mirror repo, and starts from hash [c345bb4](https://github.com/ElemeFE/element/commit/c345bb453bf11badb4831a6a3f600c9372b3a336) of the original repository, we will republish it as a new  package named `@fuddy-duddy/element-ui`.

If you want to check the documentation, please refer to the [original repository](https://github.com/ElemeFE/element/commit/c345bb453bf11badb4831a6a3f600c9372b3a336).

## Goal
Provide the unified dev environments(thru `VSCode .devcontainer`), and complete the missing `theme` feature(currently it throw 500 error at [https://element.eleme.io/#/en-US/theme](https://element.eleme.io/#/en-US/theme)).

## Caveats

<mark>Please develop this repo under Windows WSL and with VSCode devcontainer.</mark>

## How to use

You can use the `npm resolutions` feature to keep the `import * as ElementUI from 'element-ui';` statement still works.

```json
"resolutions": {
  "element-ui": "npm:@fuddy-duddy/element-ui@^1.0.0"
},
"dependencies": {
  "element-ui": "npm:@fuddy-duddy/element-ui@^1.0.0"
}
```

## Changes

Fuddy-duddy had made some changes from the original repository:

- Add a new theme feature(http://localhost:8086)

  This is for exporting the **theme**, and add a new default theme named `fuddy-duddy`.

- Upgrade used packages

- Add the support for the `.mjs` files(This is optional, copied from Lenovo internal project - "A11y Enhanced Element-UI")

## Contributing

Please use these versions:

```text
>node --version
v16.20.2

>npm --version
8.19.4

>yarn --version
1.22.22
```