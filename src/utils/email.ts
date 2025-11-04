// utils/email.ts
import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

export class EmailService {
  private static transporter = nodemailer.createTransporter(emailConfig);

  static async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: '"StackSniper" <noreply@stacksniper.com>',
      to: email,
      subject: 'Verify Your StackSniper Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to StackSniper! 🚀</h2>
          <p>Hi ${name},</p>
          <p>Thanks for signing up! Please verify your email address to start using StackSniper.</p>
          <a href="${verificationUrl}" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
          <p>Or copy this link: <br/>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendPasswordResetEmail(email: string, token: string, name: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: '"StackSniper" <noreply@stacksniper.com>',
      to: email,
      subject: 'Reset Your StackSniper Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password.</p>
          <a href="${resetUrl}" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
          <p>Or copy this link: <br/>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}
