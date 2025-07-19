import bcrypt from 'bcrypt';
import { User } from '../db/schema';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { OtpService } from './otpService';
import { LocaleService } from './localeService';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';
import { 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse, 
  OtpVerificationRequest,
  RefreshTokenRequest
} from '../types/auth';
import logger from '../utils/logger';

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const otpService = new OtpService();

export class AuthService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      logger.info('Creating user', { phone: userData.phone });

      // Validate country code
      if (!LocaleService.validateCountryCode(userData.countryCode)) {
        throw new Error('Invalid country code');
      }

      // Validate language
      if (!LocaleService.validateLanguage(userData.preferredLanguage)) {
        throw new Error('Invalid language preference');
      }

      // Validate phone number format for the selected country
      if (!LocaleService.validatePhoneNumber(userData.phone, userData.countryCode)) {
        throw new Error('Invalid phone number format for the selected country');
      }

      // Check if user already exists
      const existingUser = await userRepository.findByPhone(userData.phone);
      if (existingUser) {
        throw new Error('User with this phone number already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create new user with isVerified: false
      const newUser = await userRepository.create({
        phoneNumber: userData.phone,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        countryCode: userData.countryCode,
        preferredLanguage: userData.preferredLanguage,
        isVerified: false,
      });

      // Send OTP for verification
      await otpService.sendSmsOtp(newUser.id, userData.phone);

      return newUser;
    } catch (error) {
      logger.error('Error creating user', { error });
      throw error;
    }
  }

  static async verifyOtpAndActivateUser(verificationData: OtpVerificationRequest): Promise<AuthResponse> {
    try {
      logger.info('Verifying OTP and activating user', { phone: verificationData.phoneNumber });

      // Find user by phone number
      const user = await userRepository.findByPhone(verificationData.phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify OTP
      const otpResult = await otpService.verifyOtp(user.id, verificationData.otpCode);
      if (!otpResult.success) {
        throw new Error(otpResult.message);
      }

      // Create session and tokens
      const authResponse = await this.createAuthResponse(user);
      
      logger.info('User activated successfully', { userId: user.id });
      return authResponse;
    } catch (error) {
      logger.error('Error verifying OTP and activating user', { error });
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

  static async signin(loginData: LoginRequest, deviceInfo?: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      logger.info('User signin attempt', { phone: loginData.phone });

      // Validate user credentials
      const user = await this.validateUser(loginData);
      if (!user) {
        throw new Error('Invalid phone number or password');
      }

      // Check if user is verified
      if (!user.isVerified) {
        throw new Error('Account not verified. Please verify your phone number first.');
      }

      // Create session and tokens
      const authResponse = await this.createAuthResponse(user, deviceInfo, ipAddress);
      
      logger.info('User signed in successfully', { userId: user.id });
      return authResponse;
    } catch (error) {
      logger.error('Error during signin', { error });
      throw error;
    }
  }

  static async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      logger.info('Refreshing token');

      // Find session by refresh token
      const session = await sessionRepository.findByRefreshToken(refreshTokenData.refreshToken);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Get user
      const user = await userRepository.findById(session.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Deactivate old session
      await sessionRepository.deactivateSession(session.id);

      // Create new session and tokens
      const authResponse = await this.createAuthResponse(user);
      
      logger.info('Token refreshed successfully', { userId: user.id });
      return authResponse;
    } catch (error) {
      logger.error('Error refreshing token', { error });
      throw error;
    }
  }

  static async logout(userId: string, sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        // Logout from specific session
        await sessionRepository.deactivateSession(sessionId);
        logger.info('User logged out from specific session', { userId, sessionId });
      } else {
        // Logout from all sessions
        await sessionRepository.deactivateAllUserSessions(userId);
        logger.info('User logged out from all sessions', { userId });
      }
    } catch (error) {
      logger.error('Error during logout', { error });
      throw error;
    }
  }

  private static async createAuthResponse(user: User, deviceInfo?: string, ipAddress?: string): Promise<AuthResponse> {
    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      preferredLanguage: user.preferredLanguage,
    });

    const refreshToken = generateRefreshToken();

    // Create session
    await sessionRepository.create({
      userId: user.id,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredLanguage: user.preferredLanguage,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  static async findUserByPhone(phone: string): Promise<User | null> {
    return await userRepository.findByPhone(phone);
  }

  static async findUserById(id: string): Promise<User | null> {
    return await userRepository.findById(id);
  }

  static async updateUserLanguage(userId: string, language: 'en' | 'am'): Promise<User> {
    try {
      if (!LocaleService.validateLanguage(language)) {
        throw new Error('Invalid language preference');
      }

      const updatedUser = await userRepository.update(userId, { preferredLanguage: language });
      logger.info('User language updated', { userId, language });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user language', { error });
      throw error;
    }
  }

  static async resendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }

      return await otpService.resendOtp(user.id, phoneNumber);
    } catch (error) {
      logger.error('Error resending OTP', { error });
      throw error;
    }
  }
}
