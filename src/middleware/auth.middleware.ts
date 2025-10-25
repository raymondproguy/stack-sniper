// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

// Simplified middleware - in production, verify Firebase token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    // For now, we'll use a simple user ID from header
    // In production, verify Firebase token and get user from it
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
