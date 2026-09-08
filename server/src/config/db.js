import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB database via Mongoose.
 * Fails safely and provides clear error logs if connection string is missing or unreachable.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI environment variable is not defined.');
    console.warn('⚠️  Database functionality will be unavailable until a valid MongoDB URI is provided.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Please verify that MongoDB URI is correct and Network Access in Atlas allows 0.0.0.0/0.');
    return false;
  }
};

/**
 * Helper to check current database connection status.
 */
export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};
