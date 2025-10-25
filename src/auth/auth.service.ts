// src/auth/auth.service.ts
import { User } from '../models/User.model';
import { logInfo, logError } from '../utils/logger';

export class AuthService {
  async findOrCreateUser(firebaseUser: any) {
    try {
      let user = await User.findOne({ uid: firebaseUser.uid });
      
      if (!user) {
        user = new User({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
          emailVerified: firebaseUser.emailVerified || false,
          lastLogin: new Date()
        });
        await user.save();
        logInfo(`New user created: ${firebaseUser.email}`, 'AuthService');
      } else {
        user.lastLogin = new Date();
        await user.save();
      }
      
      return user;
    } catch (error) {
      logError(`Error in findOrCreateUser: ${error}`, 'AuthService');
      throw error;
    }
  }

  async getUserById(uid: string) {
    return await User.findOne({ uid });
  }
}
