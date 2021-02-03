# Mongo Singleton

[![NPM version][npm-img]][npm]
[![Node.js CI][ci-img]][ci]
[![XO code style][xo-img]][xo]


[npm-img]:         https://img.shields.io/npm/v/@tadashi/mongo-singleton.svg
[npm]:             https://www.npmjs.com/package/@tadashi/mongo-singleton
[ci-img]:          https://github.com/lagden/mongo-singleton/workflows/Node.js%20CI/badge.svg
[ci]:              https://github.com/lagden/mongo-singleton/actions?query=workflow%3A%22Node.js+CI%22
[xo-img]:          https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo]:              https://github.com/sindresorhus/xo

-----

Simplifying MongoDB

## Install

```
$ npm i -S @tadashi/mongo-singleton
```


## API

### Environment variables available

- MONGO_CONN
- MONGO_DB
- MONGO_USER
- MONGO_PASS
- MONGO_AUTHSOURCE
- MONGO_POOL_SIZE = 10

### Mongo.conn( \[args\]):MongoClient

Name        | Type                 | Default           | Description
----------- | -------------------- | ----------------- | ------------
args        | object               | {}                | [See bellow](#args)


#### args

Name        | Type                 | Default           | Description
----------- | -------------------- | ----------------- | ------------
url         | string               | MONGO_CONN        | [See the manual](https://docs.mongodb.com/manual/reference/connection-string/)
user        | string               | MONGO_USER        | Database user
password    | string               | MONGO_PASS        | Database password
options     | object               | {}                | [See the manual](https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#.connect)


### Mongo.collection(collectionName \[, options \]):Collection

Name           | Type                 | Default        | Description
-------------- | -------------------- | -------------- | ------------
collectionName | string               | -              | Collection name
options        | object               | {}             | [See bellow](#options)


#### options

Name          | Type          | Default                  | Description
------------- | ------------- | ------------------------ | ------------
dbName        | string        | MONGO_DB                 | Database name
...dbOptions  | spread        | [See bellow](#dbOptions) | [See the manual](https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#db)


##### dbOptions

Name                    | Type         | Default    | Description
----------------------- | ------------ | ---------- | ------------
noListener              | boolean      | true       | -
returnNonCachedInstance | boolean      | true       | -


## Usage

**Example A:**

```js

const Mongo = require('@tadashi/mongo-singleton')

;(async () => {
  const client = await Mongo.conn({
    url: 'mongodb://mongodb.example.com:27017',
    user: 'user',
    password: 'password'
  })
  const db = client.db('my_DB', {noListener: true, returnNonCachedInstance: true})
  await db.dropDatabase()
  // more code...
})()

```

**Example B:**

```js
// Set the environment variables before start the application
// - MONGO_CONN
// - MONGO_DB
// - MONGO_USER
// - ...
const Mongo = require('@tadashi/mongo-singleton')

;(async () => {
  // will return the collection if exists or create new one
  const collection = await Mongo.collection('users')
  const users = await collection.find({name: 'Tadashi'}).toArray()
  // more code...
})()

```


## License

MIT © [Thiago Lagden](https://github.com/lagden)
