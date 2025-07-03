import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types/auth';

// Mock database for demonstration - replace with actual database
const users: User[] = [];

export class AuthService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    // Check if user already exists
    const existingUser = users.find(user => user.phone === userData.phone);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone: userData.phone,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    return newUser;
  }

  static async validateUser(loginData: LoginRequest): Promise<User | null> {
    const user = users.find(u => u.phone === loginData.phone);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    return isPasswordValid ? user : null;
  }

  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      phone: user.phone,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, secret, {
      expiresIn: '7d',
    });
  }

  static createAuthResponse(user: User): AuthResponse {
    const token = this.generateToken(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
