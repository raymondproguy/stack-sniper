import crypto from 'crypto';

export class PasswordService {
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  static hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
