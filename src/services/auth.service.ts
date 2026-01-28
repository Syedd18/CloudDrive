import bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/user.repository';
import { signToken } from '@/lib/auth';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@/lib/errors';
import logger from '@/lib/logger';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with avatar
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=4285f4&color=fff&size=200`;

    const user = await userRepository.create({
      email,
      name,
      password: hashedPassword,
      avatar,
    });

    logger.info(`User registered: ${user.email}`);

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatar || null,
      },
      token,
    };
  }

  /**
   * Login existing user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      throw new UnauthorizedError('Please use the login method you signed up with');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    logger.info(`User logged in: ${user.email}`);

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatar || null,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      avatar: user.avatar || null,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; avatar?: string }
  ) {
    const user = await userRepository.update(userId, updates);

    logger.info(`User profile updated: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      throw new UnauthorizedError('Cannot change password for accounts using social login');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userRepository.update(userId, { password: hashedPassword });

    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Request password reset - creates a verification token and returns a reset URL
   */
  async requestPasswordReset(email: string): Promise<{ resetUrl: string | null }> {
    const user = await userRepository.findByEmail(email);

    // don't reveal whether user exists
    if (!user) {
      return { resetUrl: null };
    }

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // store token in verification_tokens table
    const { prisma } = await import('@/lib/prisma');
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // If SMTP is configured, send email. Otherwise log and return the URL (dev).
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: (process.env.SMTP_SECURE === 'true') || false,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });

        const from = process.env.SMTP_FROM || `no-reply@${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'example.com').host}`;

        await transporter.sendMail({
          from,
          to: user.email,
          subject: 'Reset your CloudDrive password',
          html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });

        logger.info(`Password reset email sent to ${user.email}`);
        return { resetUrl: null };
      } catch (err: any) {
        logger.error('Failed to send reset email', err);
        // fallthrough to returning the resetUrl for dev
      }
    }

    // Log the reset URL (dev) if SMTP not configured or sending failed
    logger.info(`Password reset requested for ${user.email}. Reset URL: ${resetUrl}`);

    return { resetUrl };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { prisma } = await import('@/lib/prisma');

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expires < new Date()) {
      throw new Error('Invalid or expired token');
    }

    const user = await userRepository.findByEmail(record.identifier);
    if (!user) throw new Error('User not found');

    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 12);
    await userRepository.update(user.id, { password: hashed });

    // delete token
    await prisma.verificationToken.delete({ where: { token } });

    logger.info(`Password reset for user: ${user.email}`);
  }
}

export const authService = new AuthService();
