// auth/auth.service.ts
import { User, IUser } from '../models/User.model.js';
import { JWTService } from '../utils/jwt.js';
import { PasswordService } from '../utils/password.js';
import { EmailService } from '../utils/email.js';
import { logInfo, logError } from '../utils/logger.js';

export class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create user
      const user = new User({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        verificationToken: PasswordService.generateVerificationToken()
      });

      await user.save();

      // Generate JWT token
      const token = JWTService.generateToken(user);

      // Send verification email (in background)
      EmailService.sendVerificationEmail(user.email, user.verificationToken!, user.name)
        .catch(error => logError('Failed to send verification email: ' + error, 'AuthService'));

      logInfo(`New user registered: ${user.email}`, 'AuthService');
      
      return { user, token };
    } catch (error) {
      logError(`Registration failed: ${error}`, 'AuthService');
      throw error;
    }
  }

  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    try {
      // Find user
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update user stats
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      // Generate token
      const token = JWTService.generateToken(user);

      logInfo(`User logged in: ${user.email}`, 'AuthService');
      return { user, token };
    } catch (error) {
      logError(`Login failed: ${error}`, 'AuthService');
      throw error;
    }
  }

  static async verifyEmail(token: string): Promise<IUser> {
    const user = await User.findOne({ 
      verificationToken: token,
      isVerified: false
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    logInfo(`Email verified: ${user.email}`, 'AuthService');
    return user;
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = PasswordService.generateResetToken();
    user.resetPasswordToken = PasswordService.hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await user.save();

    // Send reset email
    await EmailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    
    logInfo(`Password reset requested for: ${user.email}`, 'AuthService');
  }

  static async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const hashedToken = PasswordService.hashResetToken(token);
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    logInfo(`Password reset for: ${user.email}`, 'AuthService');
    return user;
  }

  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateProfile(userId: string, updates: {
    name?: string;
    avatar?: string;
    preferences?: any;
  }): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      throw new Error('User not found');
    }

    logInfo(`Profile updated for: ${user.email}`, 'AuthService');
    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logInfo(`Password changed for: ${user.email}`, 'AuthService');
  }
}
