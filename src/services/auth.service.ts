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
}

export const authService = new AuthService();
