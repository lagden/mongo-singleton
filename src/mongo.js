import process from 'node:process'
import readSecrets from '@tadashi/docker-secrets'
import {MongoClient, ObjectId} from 'mongodb'

function valueOf() {
	return this.toString()
}

ObjectId.prototype.valueOf = valueOf

const {
	MONGO_CONN,
	MONGO_DB,
	MONGO_USER,
	MONGO_PASS,
	MONGO_AUTHSOURCE,
	MONGO_POOL_SIZE: maxPoolSize = 10,
} = process.env

const CLIENT_KEY = Symbol.for('mongo.client')
const mongoSingleton = Object.create(null)

async function conn(args = {}) {
	let {
		url = MONGO_CONN,
		username = MONGO_USER,
		password = MONGO_PASS,
		authSource = MONGO_AUTHSOURCE,
		options = {},
	} = args

	if (mongoSingleton[CLIENT_KEY]) {
		return mongoSingleton[CLIENT_KEY]
	}

	const mongoOptions = {
		maxPoolSize,
		...options,
	}

	if (authSource) {
		mongoOptions.authSource = authSource
	}

	if (username && password) {
		password = await readSecrets(password)
		mongoOptions.auth = {
			username,
			password,
		}
	}

	const client = await MongoClient.connect(url, mongoOptions)
	mongoSingleton[CLIENT_KEY] = client
	return mongoSingleton[CLIENT_KEY]
}

async function collection(collectionName, options = {}) {
	const {
		dbName = MONGO_DB,
		dbOptions = {},
		collectionOptions = {
			writeConcern: {w: 1},
		},
	} = options

	const client = await conn()
	const db = client.db(dbName, dbOptions)
	return db.collection(collectionName, collectionOptions)
}

const Mongo = Object.create(null)
Mongo.conn = conn
Mongo.collection = collection

Object.freeze(Mongo)

export default Mongo
