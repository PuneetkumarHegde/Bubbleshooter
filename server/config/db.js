import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MONGODB_URI } from './gameConfig.js';

let mongod = null;

export async function connectDB() {
  try {
    // Attempt standard connection first with 2.5s timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to database: ${MONGODB_URI}`);
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${MONGODB_URI} failed (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to in-memory instance at ${uri}`);
    } catch (memErr) {
      console.error('[MongoDB] In-memory database failed:', memErr.message);
      throw memErr;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

