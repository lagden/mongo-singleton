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
		writeConcern: {
			w: 1,
			j: true
		},
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
	const {
		dbName = MONGO_DB,
		dbOptions = {
			noListener: true,
			returnNonCachedInstance: true
		},
		collectionOptions = {
			writeConcern: {w: 1},
			strict: false
		}
	} = options

	const client = await conn()
	const db = client.db(dbName, dbOptions)
	return db.collection(collectionName, collectionOptions)
}

const Mongo = Object.create(null)
Mongo.conn = conn
Mongo.collection = collection

Object.freeze(Mongo)

module.exports = Mongo
