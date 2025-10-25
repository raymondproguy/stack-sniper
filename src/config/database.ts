// src/config/database.ts
import mongoose from 'mongoose';
import { logSuccess, logError } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stacksniper';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logSuccess('MongoDB connected successfully', 'Database');
  } catch (error) {
    logError(`MongoDB connection error: ${error}`, 'Database');
    process.exit(1);
  }
};
