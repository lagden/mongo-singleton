import process from 'node:process'
import readSecrets from '@tadashi/docker-secrets'
import {MongoClient, ObjectId} from 'mongodb'
import * as debug from './debug.js'

/**
 * Function to override the valueOf method for ObjectId instances.
 * @returns {string} - String representation of the ObjectId.
 */
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
	MONGO_DIRECT_CONNECTION: directConnection = false,
	MONGO_POOL_SIZE: maxPoolSize = 10,
} = process.env

const CLIENT_KEY = Symbol.for('mongo.client')
const mongoSingleton = Object.create(null)

/**
 * Event handler for MongoDB client events.
 * @param {Object} event - MongoDB client event object.
 */
function eventHandler(event) {
	debug.log('\nreceived event:\n', event)
}

/**
 * Creates connection options based on the provided parameters.
 * @param {Object} args - Configuration parameters.
 * @param {string} [args.username] - MongoDB username.
 * @param {string} [args.password] - MongoDB password.
 * @param {string} [args.authSource] - MongoDB authentication source.
 * @param {Object} [args.options] - Other MongoDB connection options.
 * @returns {Object} - MongoDB connection options.
 */
async function createConnectionOptions(args = {}) {
	let {
		username = MONGO_USER,
		password = MONGO_PASS,
		authSource = MONGO_AUTHSOURCE,
		options = {},
	} = args

	debug.info('createConnectionOptions | args', args)
	debug.info('createConnectionOptions | username', username)
	debug.info('createConnectionOptions | password', password)
	debug.info('createConnectionOptions | authSource', authSource)
	debug.info('createConnectionOptions | options', options)

	const connectionOptions = {
		compressors: ['zlib'],
		directConnection,
		connectTimeoutMS: 10_000,
		maxIdleTimeMS: 30_000,
		maxPoolSize,
		minPoolSize: 1,
		socketTimeoutMS: 30_000,
		zlibCompressionLevel: 5,
		...options,
	}

	if (authSource) {
		connectionOptions.authSource = authSource
	}

	if (username && password) {
		connectionOptions.auth = {
			username,
			password: await readSecrets(password),
		}
	}

	return connectionOptions
}

/**
 * Establishes a connection to the MongoDB database.
 * @param {Object} args - Connection parameters.
 * @param {string} [args.url=MONGO_CONN] - MongoDB connection URL.
 * @param {Object} [args.options] - Other MongoDB connection options.
 * @returns {Promise<MongoClient>} - MongoDB client instance.
 */
async function conn(args = {}) {
	if (mongoSingleton[CLIENT_KEY]) {
		return mongoSingleton[CLIENT_KEY]
	}
	const {
		url = MONGO_CONN,
		...restArgs
	} = args

	const connectionOptions = await createConnectionOptions(restArgs)
	
	debug.info('conn | url', url)
	debug.info('conn | connectionOptions', connectionOptions)
	
	const client = await MongoClient.connect(url, connectionOptions)

	mongoSingleton[CLIENT_KEY] = client
	return mongoSingleton[CLIENT_KEY]
}

/**
 * Retrieves a MongoDB collection.
 * @param {string} collectionName - Name of the MongoDB collection.
 * @param {Object} [options={}] - Collection options.
 * @param {string} [options.dbName=MONGO_DB] - Name of the MongoDB database.
 * @param {Object} [options.dbOptions={}] - Database options.
 * @param {Object} [options.collectionOptions={}] - Collection options.
 * @returns {Promise<Collection>} - MongoDB collection instance.
 */
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

/**
 * Object containing MongoDB utility functions.
 * @type {Object}
 */
const Mongo = Object.create(null)

/**
 * Function to establish a MongoDB connection.
 * @type {Function}
 * @memberof Mongo
 */
Mongo.conn = conn

/**
 * Function to retrieve a MongoDB collection.
 * @type {Function}
 * @memberof Mongo
 */
Mongo.collection = collection

/**
 * Function to retrieve the MongoDB client instance.
 * @type {Function}
 * @memberof Mongo
 */
Mongo.client = () => mongoSingleton[CLIENT_KEY]

/**
 * Function to reset the MongoDB connection.
 * @type {Function}
 * @memberof Mongo
 */
Mongo.reset = async () => {
	if (mongoSingleton[CLIENT_KEY]) {
		await Mongo.close()
		mongoSingleton[CLIENT_KEY].removeAllListeners()
		mongoSingleton[CLIENT_KEY] = undefined
	}
}

/**
 * Function to close the MongoDB connection.
 * @type {Function}
 * @memberof Mongo
 * @param {boolean} [force=false] - Whether to force close the connection.
 */
Mongo.close = (force = false) => {
	if (mongoSingleton[CLIENT_KEY]) {
		return mongoSingleton[CLIENT_KEY].close(force)
	}
}

/**
 * Attaches event listeners to the MongoDB client for specified events that are not already attached.
 * @memberof Mongo
 * @type {Function}
 */
Mongo.clientEvents = () => {
	const client = Mongo.client()
	const events = new Set(client.eventNames())
	const eventsAdd = [
		'connectionCreated',
		'connectionClosed',
		'connectionPoolCreated',
		'connectionPoolReady',
		'connectionPoolCleared',
		'connectionPoolClosed',
	]
	if (client) {
		for (const event of eventsAdd) {
			if (events.has(event) === false) {
				client.on(event, eventHandler)
			}
		}
		console.log('eventNames after', client.eventNames())
	}
}

/**
 * Freezes the Mongo object to prevent modification.
 */
Object.freeze(Mongo)

export default Mongo
