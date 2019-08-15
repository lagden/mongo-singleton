/* eslint capitalized-comments: 0 */

'use strict'

import test from 'ava'
import {MongoMemoryServer} from 'mongodb-memory-server'
import Mongo from '..'

const mongod = new MongoMemoryServer({
	binary: {
		version: '4.0.6'
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
	const mongoConn = await mongod.getConnectionString()
	const mongoDB = await mongod.getDbName()
	const client = await Mongo.conn({url: mongoConn})
	const db = await client.db(mongoDB, {noListener: true, returnNonCachedInstance: true})
	const admin = db.admin()
	const {databases} = await admin.listDatabases()

	const collections = []
	for (const database of databases) {
		collections.push(_collections(client, database.name))
	}

	const collectionsName = ['system.version', 'system.sessions', 'startup_log']
	for await (const [collection] of collections) {
		t.true(collectionsName.includes(collection.s.namespace.collection))
	}

	t.true(Array.isArray(databases))
	t.is(databases.length, 3)
})

test('collection', async t => {
	const mongoConn = await mongod.getConnectionString()
	const mongoDB = await mongod.getDbName()
	await Mongo.conn({url: mongoConn})
	const collection = await Mongo.collection('auth', mongoDB)
	t.is(collection.dbName, mongoDB)
	t.is(collection.collectionName, 'auth')
})
