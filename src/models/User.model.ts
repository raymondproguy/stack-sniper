// src/models/User.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
  isAdmin?: boolean;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: String,
  provider: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
});

export const User = model<IUser>('User', UserSchema);
