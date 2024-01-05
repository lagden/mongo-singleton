// import {setTimeout} from 'node:timers/promises'
import {test, after} from 'node:test'
import assert from 'node:assert/strict'
import {MongoMemoryServer, MongoMemoryReplSet} from 'mongodb-memory-server'
import {ObjectId} from 'mongodb'
import Mongo from '../src/mongo.js'

const replSet = await MongoMemoryReplSet.create({
	binary: {
		version: '6.0.9',
	},
	replSet: {
		count: 2,
	}
})

const mongodAuth = await MongoMemoryServer.create({
	auth: {
		enable: true,
	},
	binary: {
		version: '6.0.9',
	},
	instance: {
		storageEngine: 'wiredTiger',
	},
})

async function _collections(client, _db) {
	const db = await client.db(_db)
	return db.collections()
}

after(async () => {
	try {
		const client = Mongo.client()
		await client.close()
		await replSet.stop({doCleanup: true})
		await mongodAuth.stop({doCleanup: true})
	} catch (error) {
		console.log('error >>', error.message)
	}
})

test('db', async () => {
	const mongoConn = await replSet.getUri()
	const client = await Mongo.conn({url: mongoConn})
	Mongo.clientEvents()
	const db = await client.db('admin')
	const admin = db.admin()
	const {databases} = await admin.listDatabases()

	const collections = []
	for (const database of databases) {
		collections.push(_collections(client, database.name))
	}

	for await (const [collection] of collections) {
		console.log('collection', collection.s.namespace.collection)
	}

	assert.ok(Array.isArray(databases))
	assert.ok(true)
})

test('collection', async () => {
	const mongoConn = await replSet.getUri()
	await Mongo.conn({url: mongoConn})
	const collection1 = await Mongo.collection('collection_test_same', {dbName: 'db_test'})
	const collection2 = await Mongo.collection('collection_test_same', {dbName: 'db_test'})
	assert.equal(collection1.dbName, 'db_test')
	assert.equal(collection1.collectionName, 'collection_test_same')
	assert.equal(collection2.dbName, 'db_test')
	assert.equal(collection2.collectionName, 'collection_test_same')
	assert.notEqual(collection1, collection2)
})

test('valueOf', () => {
	const objectId = ObjectId.createFromTime(Date.now() / 1000)
	assert.equal(typeof objectId.valueOf(), 'string')
})

test('auth', async () => {
	let cli
	try {
		await Mongo.reset()
		const mongoConn = await mongodAuth.getUri()
		cli = await Mongo.conn({
			url: mongoConn,
			username: mongodAuth.auth.customRootName,
			password: mongodAuth.auth.customRootPwd,
			authSource: 'admin',
		})
	} finally {
		if (cli?.close) {
			cli.close()
		}
	}

	assert.ok(true)
})
