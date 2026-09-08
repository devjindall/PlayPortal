import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB database via Mongoose.
 * Fails safely and provides clear error logs if connection string is missing or unreachable.
 */
export const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI environment variable is not defined in .env.');
    console.warn('⚠️  Database functionality will be unavailable until a valid MongoDB URI is provided.');
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Please verify that MongoDB is running locally or check your connection string in .env.');
    return false;
  }
};

/**
 * Helper to check current database connection status.
 */
export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};
