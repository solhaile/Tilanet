import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, NewUser } from '../db/schema';
import { UserRepository } from '../repositories/UserRepository';
import logger from '../utils/logger';

// Legacy types for compatibility
export interface CreateUserRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: Omit<User, 'password'>;
    token: string;
  };
}

const userRepository = new UserRepository();

export class AuthService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      logger.info('Creating user', { phone: userData.phone });
      // Check if user already exists
      const existingUser = await userRepository.findByPhone(userData.phone);
      if (existingUser) {
        throw new Error('User with this phone number already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create new user with Drizzle schema
      const newUser = await userRepository.create({
        phoneNumber: userData.phone,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      return newUser;
    } catch (error) {
      logger.error('Error creating user', { error });
      throw error;
    }
  }

  static async validateUser(loginData: LoginRequest): Promise<User | null> {
    try {
      logger.info('Validating user', { phone: loginData.phone });
      const user = await userRepository.findByPhone(loginData.phone);
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      return isPasswordValid ? user : null;
    } catch (error) {
      logger.error('Error validating user', { error });
      throw error;
    }
  }

  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      phone: user.phoneNumber,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  static createAuthResponse(user: User): AuthResponse {
    const token = this.generateToken(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    };
  }
}
