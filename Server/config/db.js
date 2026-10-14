import mongoose from 'mongoose';
import { config } from '../auth/config.js';

// Reuse the connection across concurrent/reused serverless invocations.
let pendingConnection;
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!pendingConnection) {
    pendingConnection = mongoose.connect(config.mongoUri, {
      dbName: config.mongoDb,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).then(() => {
      console.log(`MongoDB connected: ${config.mongoDb}`);
      return mongoose.connection;
    }).finally(() => {
      pendingConnection = undefined; // A disconnected instance can reconnect.
    });
  }
  return pendingConnection;
}

// Legacy product controller uses the native MongoDB collection API.
export function getDB() {
  if (!mongoose.connection.db) throw new Error('MongoDB is not connected');
  return mongoose.connection.db;
}
