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

test('basic', async t => {
	const mongoConn = await mongod.getConnectionString()
	const mongoDB = await mongod.getDbName()
	await Mongo.conn(mongoConn)
	const collection = await Mongo.collection('auth', mongoDB)
	t.is(collection.dbName, mongoDB)
	t.is(collection.collectionName, 'auth')
})
