# Mongo Singleton

[![NPM version][npm-img]][npm]
[![Node.js CI][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]


[npm-img]:         https://img.shields.io/npm/v/@tadashi/mongo-singleton.svg
[npm]:             https://www.npmjs.com/package/@tadashi/mongo-singleton
[ci-img]:          https://github.com/lagden/mongo-singleton/actions/workflows/nodejs.yml/badge.svg
[ci]:              https://github.com/lagden/mongo-singleton/actions/workflows/nodejs.yml
[coveralls-img]:   https://coveralls.io/repos/github/lagden/mongo-singleton/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/mongo-singleton?branch=master

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

Name        | Type      | Default           | Description
----------- | --------- | ----------------- | ------------
args        | object    | {}                | [See bellow](#args)


#### args

Name        | Type      | Default                        | Description
----------- | --------- | ------------------------------ | ------------
url         | string    | MONGO_CONN                     | [See the manual](https://www.mongodb.com/docs/manual/reference/connection-string/)
username    | string    | MONGO_USER                     | Database user
password    | string    | MONGO_PASS                     | Database password
authSource  | string    | MONGO_AUTHSOURCE               | Authentication Database
options     | object    | {maxPoolSize: MONGO_POOL_SIZE} | [See the manual](https://mongodb.github.io/node-mongodb-native/6.3/interfaces/MongoClientOptions.html)


### Mongo.collection(collectionName \[, options \]):Collection

Name           | Type      | Default        | Description
-------------- | --------- | -------------- | ------------
collectionName | string    | -              | Collection name
options        | object    | {}             | [See bellow](#options)


#### options

Name              | Type      | Default                          | Description
-------------     | --------- | -------------------------------- | ------------
dbName            | string    | MONGO_DB                         | Database name
dbOptions         | object    | {}                               | [See the manual](https://mongodb.github.io/node-mongodb-native/6.3/interfaces/DbOptions.html)
collectionOptions | object    | [See bellow](#collectionOptions) | [See the manual](https://mongodb.github.io/node-mongodb-native/6.3/interfaces/CollectionOptions.html)


##### collectionOptions

Name                    | Type      | Default    | Description
----------------------- | --------- | ---------- | ------------
writeConcern            | object    | {w: 1}     | -


## Usage

**Example A:**

```js
import Mongo from '@tadashi/mongo-singleton'

const client = await Mongo.conn({
  url: 'mongodb://mongodb.example.com:27017',
  username: 'username',
  password: 'password'
})
const db = client.db('my_DB')
await db.dropDatabase()
// more code...
```


**Example B:**

```js
// Set the environment variables before start the application
// - MONGO_CONN
// - MONGO_DB
// - MONGO_USER
// - ...
import Mongo from '@tadashi/mongo-singleton'

// will return the collection if exists or create new one
const collection = await Mongo.collection('users')
const users = await collection.find({name: 'Tadashi'}).toArray()
// more code...
```


## Donate ❤️

- BTC: bc1q7famhuj5f25n6qvlm3sssnymk2qpxrfwpyq7g4


## License

MIT © [Thiago Lagden](https://github.com/lagden)
