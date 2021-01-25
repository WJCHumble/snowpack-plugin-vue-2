# snowpack-plugin-vue-2

>note: snowpack-plugin-vue-2 isn't support vuessr development.

A Vue 2 plugin for snowpack, based on [@snowpack/vue-plugin](https://github.com/pikapkg/create-snowpack-app/blob/b1dd98639eb6da2313e62a757baca44539a85013/packages/plugin-vue/plugin.js) and [vue-loader](https://github.com/vuejs/vue-loader/blob/master/lib/loaders/templateLoader.js)

## Running test

First, You should git clone the project GitHub, and to be able to run test folder without dependency issues, we first need to pack plugin as tgz:

```
npm pack
cd test
npm install
npm start
```

## TODO

1.use ts to refactor

2.optimzer test way, such as use jest

3.support vuessr
