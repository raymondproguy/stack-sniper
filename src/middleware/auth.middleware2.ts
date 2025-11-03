// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.config.js';
import { User } from '../models/User.model.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided. Format: Authorization: Bearer <token>' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    console.log('🔐 Verifying Firebase token...');
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Token verified for UID:', decodedToken.uid);

    // Get user details from Firebase
    const firebaseUser = await admin.auth().getUser(decodedToken.uid);
    console.log('📧 User:', firebaseUser.email);

    // Find or create user in our MongoDB
    let user = await User.findOne({ uid: firebaseUser.uid });
    
    if (!user) {
      console.log('👤 Creating new user in database...');
      user = new User({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        provider: firebaseUser.providerData[0]?.providerId || 'firebase',
        emailVerified: firebaseUser.emailVerified || false,
        lastLogin: new Date()
      });
      await user.save();
      console.log('✅ New user created:', user.email);
    } else {
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Existing user updated:', user.email);
    }

    // Attach user to request
    req.user = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error: any) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed',
      details: error.message 
    });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    next();
  } catch (error: any) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authorization check failed' 
    });
  }
};
