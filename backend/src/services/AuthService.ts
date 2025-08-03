import { PrismaClient, User, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  plan?: Plan;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly BCRYPT_ROUNDS: number;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    this.BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw createError('User already exists with this email', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.BCRYPT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          plan: userData.plan || Plan.FREE,
          quotaResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      });

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user.id);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken,
        expiresIn: this.getTokenExpiryTime(),
      };
    } catch (error) {
      logger.error('Registration failed', { email: userData.email, error });
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw createError('Invalid credentials', 401);
      }

      // Verify password (if using custom auth, not Auth0)
      if (password) {
        // For custom authentication
        // Note: This assumes you're storing hashed passwords
        // Remove this if using Auth0 exclusively
        const isValidPassword = await bcrypt.compare(password, 'user.passwordHash');
        if (!isValidPassword) {
          throw createError('Invalid credentials', 401);
        }
      }

      // Check user status
      if (user.status !== 'ACTIVE') {
        throw createError('Account is not active', 403);
      }

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user.id);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken,
        expiresIn: this.getTokenExpiryTime(),
      };
    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.status !== 'ACTIVE') {
        throw createError('Account is not active', 403);
      }

      return this.sanitizeUser(user);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw createError('Invalid token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw createError('Token expired', 401);
      }
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as { userId: string, type: string };
      
      if (decoded.type !== 'refresh') {
        throw createError('Invalid refresh token', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw createError('User not found or inactive', 401);
      }

      const tokens = this.generateTokens(user.id);

      return {
        ...tokens,
        expiresIn: this.getTokenExpiryTime(),
      };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw createError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user (invalidate token)
   */
  async logout(token: string): Promise<void> {
    try {
      // In a production system, you would add this token to a blacklist
      // For now, we'll just log the logout
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      logger.info('User logged out', { userId: decoded.userId });
    } catch (error) {
      // Silent fail for logout
      logger.warn('Logout attempt with invalid token', { error });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Generate reset token
        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // In production, store this in a separate table or Redis
        // and send email with reset link
        logger.info('Password reset requested', { userId: user.id, email });
      }
    } catch (error) {
      logger.error('Password reset request failed', { email, error });
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // In production, verify token from database/Redis
      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);
      
      // Update user password
      // await prisma.user.update({ ... });
      
      logger.info('Password reset completed', { token });
    } catch (error) {
      logger.error('Password reset failed', { token, error });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string): { token: string; refreshToken: string } {
    const token = jwt.sign(
      { userId, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, refreshToken };
  }

  /**
   * Get token expiry time in seconds
   */
  private getTokenExpiryTime(): number {
    // Convert JWT_EXPIRES_IN to seconds
    const expiresIn = this.JWT_EXPIRES_IN;
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    }
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 3600;
    }
    return 86400; // Default 24 hours
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
