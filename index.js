'use strict'

const {MongoClient, ObjectID} = require('mongodb')

function valueOf() {
	return this.toString()
}

ObjectID.prototype.valueOf = valueOf

const {
	MONGO_CONN,
	MONGO_DB,
	MONGO_USER,
	MONGO_PASS,
	MONGO_AUTHSOURCE: authSource,
	MONGO_POOL_SIZE: poolSize = 10
} = process.env

const CLIENT_KEY = Symbol.for('mongo.client')
const mongoSingleton = Object.create(null)

function _collection(db, collectionName) {
	return new Promise((resolve, reject) => {
		db.collection(collectionName, {w: 1}, (error, collection) => {
			if (error) {
				reject(error)
			} else {
				resolve(collection)
			}
		})
	})
}

async function conn(args = {}) {
	const {
		url = MONGO_CONN,
		user = MONGO_USER,
		password = MONGO_PASS,
		options = {}
	} = args

	if (mongoSingleton[CLIENT_KEY]) {
		return mongoSingleton[CLIENT_KEY]
	}

	const mongoOptions = {
		poolSize,
		authSource,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		...options
	}

	if (user && password) {
		mongoOptions.auth = {
			user,
			password
		}
	}

	const client = await MongoClient.connect(url, mongoOptions)
	mongoSingleton[CLIENT_KEY] = client
	return mongoSingleton[CLIENT_KEY]
}

async function collection(collectionName, options = {}) {
	const {dbName, ...dbOptions} = {
		dbName: MONGO_DB,
		noListener: true,
		returnNonCachedInstance: true,
		...options
	}
	const client = await conn()
	const db = client.db(dbName, dbOptions)
	const col = await _collection(db, collectionName)
	return col
}

const Mongo = Object.create(null)
Mongo.conn = conn
Mongo.collection = collection

Object.freeze(Mongo)

module.exports = Mongo
