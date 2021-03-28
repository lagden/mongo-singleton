/* eslint capitalized-comments: 0 */

'use strict'

const test = require('ava')
const {MongoMemoryServer} = require('mongodb-memory-server')
const {ObjectID} = require('mongodb')
const Mongo = require('..')

const mongod = new MongoMemoryServer({
	binary: {
		version: '4.4.0'
	},
	instance: {
		storageEngine: 'wiredTiger'
	}
})

test.after(async () => {
	await mongod.stop()
})

async function _collections(client, _db) {
	const db = await client.db(_db, {noListener: true, returnNonCachedInstance: true})
	return db.collections()
}

test('db', async t => {
	const mongoConn = await mongod.getUri()
	const mongoDB = await mongod.getDbName()
	const client = await Mongo.conn({url: mongoConn})
	const db = await client.db(mongoDB, {noListener: true, returnNonCachedInstance: true})
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
})

test('collection', async t => {
	const mongoConn = await mongod.getUri()
	await Mongo.conn({url: mongoConn})
	const collection = await Mongo.collection('collection_test', {dbName: 'db_test'})
	t.is(collection.dbName, 'db_test')
	t.is(collection.collectionName, 'collection_test')
})

test('valueOf', t => {
	let objectID = ObjectID.createFromTime(Date.now())
	t.is(typeof objectID.valueOf(), 'string')
})
