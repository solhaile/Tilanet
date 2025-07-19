import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { OtpService } from '../services/otpService';
import { UserRepository } from '../repositories/UserRepository';
import { ApiResponse } from '../types/common';
import logger from '../utils/logger';

export class OtpController {
  private otpService: OtpService;
  private userRepository: UserRepository;

  constructor() {
    this.otpService = new OtpService();
    this.userRepository = new UserRepository();
  }

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg, // Use the first specific error message
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const { phoneNumber } = req.body;

      // Find user by phone number
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const result = await this.otpService.sendSmsOtp(user.id, phoneNumber);

      // Return appropriate status code based on result
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg, // Use the first specific error message
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const { phoneNumber, otpCode } = req.body;

      // Find user by phone number
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const result = await this.otpService.verifyOtp(user.id, otpCode);

      // Return appropriate status code based on result
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        data: result.success ? { isVerified: true } : undefined
      });
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: errors.array()[0].msg, // Use the first specific error message
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const { phoneNumber } = req.body;

      // Find user by phone number
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const result = await this.otpService.resendOtp(user.id, phoneNumber);

      // Return appropriate status code based on result
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
