// src/models/History.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IHistory extends Document {
  userId: string;
  feature: 'debug' | 'review' | 'rewrite' | 'explain' | 'snipe';
  query: string;
  response: string;
  source: 'ai' | 'stackoverflow';
  timestamp: Date;
  metadata: {
    errorType?: string;
    codeLanguage?: string;
    tokensUsed?: number;
    responseTime?: number;
    isFavorite?: boolean;
  };
}

const HistorySchema = new Schema<IHistory>({
  userId: { type: String, required: true, index: true },
  feature: { type: String, required: true, enum: ['debug', 'review', 'rewrite', 'explain', 'snipe'] },
  query: { type: String, required: true },
  response: { type: String, required: true },
  source: { type: String, required: true, enum: ['ai', 'stackoverflow'] },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    errorType: String,
    codeLanguage: String,
    tokensUsed: Number,
    responseTime: Number,
    isFavorite: { type: Boolean, default: false }
  }
});

// Create indexes for better performance
HistorySchema.index({ userId: 1, timestamp: -1 });
HistorySchema.index({ userId: 1, 'metadata.isFavorite': 1 });

export const History = model<IHistory>('History', HistorySchema);
