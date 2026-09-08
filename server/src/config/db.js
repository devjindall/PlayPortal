import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB database via Mongoose.
 * Fails safely and provides clear error logs if connection string is missing or unreachable.
 */
let lastDbError = null;
let connectedHost = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || env.MONGODB_URI;

  if (!uri) {
    lastDbError = 'MONGODB_URI environment variable is missing';
    console.warn('⚠️  MONGODB_URI environment variable is not defined.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    connectedHost = conn.connection.host;
    lastDbError = null;
    console.log(`✅ MongoDB Connected: ${connectedHost}`);
    return true;
  } catch (error) {
    lastDbError = error.message;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getDbDiagnostics = async () => {
  const uri = process.env.MONGODB_URI || env.MONGODB_URI;
  const isConnected = isDbConnected();

  if (!isConnected && uri) {
    // Attempt auto-reconnect
    await connectDB();
  }

  return {
    connected: isDbConnected(),
    host: connectedHost || mongoose.connection.host || null,
    uriConfigured: Boolean(uri),
    error: lastDbError,
  };
};
