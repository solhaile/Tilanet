import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { CreateUserRequest, LoginRequest } from '../types/auth';
import { ApiResponse } from '../types/common';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const userData: CreateUserRequest = req.body;
      const user = await AuthService.createUser(userData);
      const authResponse = AuthService.createAuthResponse(user);

      const response: ApiResponse = {
        success: true,
        message: 'User created successfully',
        data: authResponse,
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create user',
        error: 'Signup failed',
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
          message: 'Validation failed',
          error: errors.array().map(err => err.msg).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const loginData: LoginRequest = req.body;
      const user = await AuthService.validateUser(loginData);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid phone number or password',
          error: 'Authentication failed',
        };
        res.status(401).json(response);
        return;
      }

      const authResponse = AuthService.createAuthResponse(user);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: authResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to login',
        error: 'Signin failed',
      };
      res.status(500).json(response);
    }
  }
}
