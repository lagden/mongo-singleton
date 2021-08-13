import test from 'ava'
import {MongoMemoryServer} from 'mongodb-memory-server'
import {ObjectId} from 'mongodb'
import Mongo from '../src/mongo.js'

// Apenas um workaround
// import {createRequire} from 'module'
// const require = createRequire(import.meta.url)
// const {ObjectId} = require('mongodb')

const mongod = await MongoMemoryServer.create({
	binary: {
		version: '4.4.0',
	},
	instance: {
		storageEngine: 'wiredTiger',
	},
})

const mongodAuth = await MongoMemoryServer.create({
	auth: {},
	binary: {
		version: '4.4.0',
	},
	instance: {
		auth: true,
		storageEngine: 'wiredTiger',
	},
})

test.after(async () => {
	await mongod.stop()
	await mongodAuth.stop()
})

async function _collections(client, _db) {
	const db = await client.db(_db)
	return db.collections()
}

test('db', async t => {
	const mongoConn = await mongod.getUri()
	const mongoDB = mongod.instanceInfo.dbName
	const client = await Mongo.conn({url: mongoConn})
	const db = await client.db(mongoDB)
	const admin = db.admin()
	const {databases} = await admin.listDatabases()

	const collections = []
	for (const database of databases) {
		collections.push(_collections(client, database.name))
	}

	const collectionsName = new Set(['system.version', 'system.sessions', 'startup_log'])
	for await (const [collection] of collections) {
		t.true(collectionsName.has(collection.s.namespace.collection))
	}

	t.true(Array.isArray(databases))
	// t.snapshot(databases)
})

test('collection', async t => {
	const mongoConn = await mongod.getUri()
	await Mongo.conn({url: mongoConn})
	const collection1 = await Mongo.collection('collection_test_same', {dbName: 'db_test'})
	const collection2 = await Mongo.collection('collection_test_same', {dbName: 'db_test'})
	t.is(collection1.dbName, 'db_test')
	t.is(collection1.collectionName, 'collection_test_same')
	t.is(collection2.dbName, 'db_test')
	t.is(collection2.collectionName, 'collection_test_same')
	t.false(collection1 === collection2)
})

test('valueOf', t => {
	const objectId = ObjectId.createFromTime(Date.now() / 1000)
	t.is(typeof objectId.valueOf(), 'string')
})

test('auth', async t => {
	const mongoConn = await mongodAuth.getUri()
	console.log(mongodAuth)
	await Mongo.conn({
		url: mongoConn,
		username: mongodAuth.auth.customRootName,
		password: mongodAuth.auth.customRootPwd,
		authSource: 'admin',
	})
	t.true(true)
})
