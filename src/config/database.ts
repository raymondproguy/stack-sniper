// src/config/database.ts
import mongoose from 'mongoose';
import dotenv from "dotenv";
import { logSuccess, logError } from '../utils/logger';

dotenv.config();
// Provide a default value or throw error if not set
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

export const connectDB = async (): Promise<void> => {
  try {
    // Now MONGODB_URI is guaranteed to be a string
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    logSuccess('MongoDB connected successfully', 'Database');
  } catch (error) {
    logError(`MongoDB connection error: ${error}`, 'Database');
    process.exit(1);
  }
};
