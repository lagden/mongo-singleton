# Mongo Singleton

[![NPM version][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![XO code style][xo-img]][xo]


[npm-img]:         https://img.shields.io/npm/v/@tadashi/mongo-singleton.svg
[npm]:             https://www.npmjs.com/package/@tadashi/mongo-singleton
[ci-img]:          https://travis-ci.org/lagden/mongo-singleton.svg
[ci]:              https://travis-ci.org/lagden/mongo-singleton
[xo-img]:          https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo]:              https://github.com/sindresorhus/xo

-----

Simplifying MongoDB

## Install

```
$ npm i -S @tadashi/mongo-singleton
```


## Environment variables available

- MONGO_CONN
- MONGO_DB
- MONGO_USER
- MONGO_PASS
- MONGO_AUTHSOURCE: authSource
- MONGO_POOL_SIZE: poolSize = 10


## Usage

```js
// This way, you must setup the environment variables before start the app
// - MONGO_CONN
// - MONGO_DB
const Mongo = require('@tadashi/mongo-singleton')

;(async () => {
  // will return a collection if exists or create new one
  const collection = await Mongo.collection('users')
  const users = collection.find({name: 'Lucas'}).toArray()
  // more code...
})

```


## License

MIT © [Thiago Lagden](https://github.com/lagden)
