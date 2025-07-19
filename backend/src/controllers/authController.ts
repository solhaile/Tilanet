import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { LocaleService } from '../services/localeService';
import { CreateUserRequest, LoginRequest, OtpVerificationRequest, RefreshTokenRequest } from '../types/auth';
import { ApiResponse } from '../types/common';
import logger from '../utils/logger';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const userData: CreateUserRequest = req.body;
      
      // Create user (this will also send OTP)
      const user = await AuthService.createUser(userData);

      const response: ApiResponse = {
        success: true,
        message: 'User created successfully. Please verify your phone number with the OTP sent to your device.',
        data: {
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            preferredLanguage: user.preferredLanguage,
            isVerified: user.isVerified,
          },
          requiresVerification: true,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      // Handle duplicate phone number
      if (error.message?.includes('already exists')) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this phone number already exists',
          error: 'Phone number already exists',
        };
        res.status(409).json(response);
        return;
      }

      // Handle validation errors
      if (error.message?.includes('Invalid')) {
        const response: ApiResponse = {
          success: false,
          message: error.message,
          error: 'Validation failed',
        };
        res.status(400).json(response);
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create user',
        error: 'Signup failed',
      };
      res.status(500).json(response);
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const verificationData: OtpVerificationRequest = req.body;
      
      // Verify OTP and activate user
      const authResponse = await AuthService.verifyOtpAndActivateUser(verificationData);

      const response: ApiResponse = {
        success: true,
        message: 'Phone number verified successfully. Welcome to Tilanet!',
        data: authResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to verify OTP',
        error: 'OTP verification failed',
      };
      res.status(400).json(response);
    }
  }

  static async signin(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const loginData: LoginRequest = req.body;
      const deviceInfo = req.headers['user-agent'] as string;
      const ipAddress = req.ip || req.connection.remoteAddress as string;
      
      // Sign in user
      const authResponse = await AuthService.signin(loginData, deviceInfo, ipAddress);

      const response: ApiResponse = {
        success: true,
        message: 'Authentication successful',
        data: authResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      // Handle unverified account
      if (error.message?.includes('not verified')) {
        const response: ApiResponse = {
          success: false,
          message: error.message,
          error: 'Account not verified',
        };
        res.status(403).json(response);
        return;
      }

      // Handle invalid credentials
      if (error.message?.includes('Invalid')) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid phone number or password',
          error: 'Authentication failed',
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to login',
        error: 'Signin failed',
      };
      res.status(500).json(response);
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const refreshData: RefreshTokenRequest = req.body;
      
      // Refresh token
      const authResponse = await AuthService.refreshToken(refreshData);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: authResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to refresh token',
        error: 'Token refresh failed',
      };
      res.status(401).json(response);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.body.sessionId; // Optional: logout from specific session

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'Unauthorized',
        };
        res.status(401).json(response);
        return;
      }

      await AuthService.logout(userId, sessionId);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to logout',
        error: 'Logout failed',
      };
      res.status(500).json(response);
    }
  }

  static async getSupportedCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = LocaleService.getSupportedCountries();

      const response: ApiResponse = {
        success: true,
        message: 'Supported countries retrieved successfully',
        data: countries,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve countries',
        error: 'Countries retrieval failed',
      };
      res.status(500).json(response);
    }
  }

  static async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = LocaleService.getSupportedLanguages();

      const response: ApiResponse = {
        success: true,
        message: 'Supported languages retrieved successfully',
        data: languages,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve languages',
        error: 'Languages retrieval failed',
      };
      res.status(500).json(response);
    }
  }

  static async updateLanguage(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const userId = (req as any).user?.id;
      const { language } = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'Unauthorized',
        };
        res.status(401).json(response);
        return;
      }

      const updatedUser = await AuthService.updateUserLanguage(userId, language);

      const response: ApiResponse = {
        success: true,
        message: 'Language preference updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            phoneNumber: updatedUser.phoneNumber,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            preferredLanguage: updatedUser.preferredLanguage,
            isVerified: updatedUser.isVerified,
          },
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update language',
        error: 'Language update failed',
      };
      res.status(400).json(response);
    }
  }

  static async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg,
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const { phoneNumber } = req.body;
      
      const result = await AuthService.resendOtp(phoneNumber);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to resend OTP',
        error: 'OTP resend failed',
      };
      res.status(400).json(response);
    }
  }
}
