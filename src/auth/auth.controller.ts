// src/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { logInfo, logError } from '../utils/logger';

const authService = new AuthService();

export const authCallback = async (req: Request, res: Response) => {
  try {
    // Firebase token will be in header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // In a real implementation, you'd verify the Firebase token here
    // For now, we'll assume the token is verified and user data is in req.body
    const firebaseUser = req.body;
    
    const user = await authService.findOrCreateUser(firebaseUser);
    
    logInfo(`User authenticated: ${user.email}`, 'AuthController');
    
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    logError(`Auth callback failed: ${error}`, 'AuthController');
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logError(`Get profile failed: ${error}`, 'AuthController');
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};
