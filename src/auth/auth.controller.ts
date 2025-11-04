// auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { logInfo, logError } from '../utils/logger.js';

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    const { user, token } = await AuthService.register({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          avatar: user.avatar,
          preferences: user.preferences
        },
        token
      }
    });
  } catch (error: any) {
    logError(`Register controller error: ${error.message}`, 'AuthController');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { user, token } = await AuthService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount
        },
        token
      }
    });
  } catch (error: any) {
    logError(`Login controller error: ${error.message}`, 'AuthController');
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
}

export async function verifyEmailController(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    const user = await AuthService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error: any) {
    logError(`Verify email error: ${error.message}`, 'AuthController');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function forgotPasswordController(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    await AuthService.forgotPassword(email);

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error: any) {
    logError(`Forgot password error: ${error.message}`, 'AuthController');
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    const user = await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error: any) {
    logError(`Reset password error: ${error.message}`, 'AuthController');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function getProfileController(req: Request, res: Response) {
  try {
    const user = await AuthService.getProfile(req.user.userId);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    logError(`Get profile error: ${error.message}`, 'AuthController');
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}

export async function updateProfileController(req: Request, res: Response) {
  try {
    const { name, avatar, preferences } = req.body;
    
    const user = await AuthService.updateProfile(req.user.userId, {
      name,
      avatar,
      preferences
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error: any) {
    logError(`Update profile error: ${error.message}`, 'AuthController');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    logError(`Change password error: ${error.message}`, 'AuthController');
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}
