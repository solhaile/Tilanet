import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/common';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: 'Access token is required',
      error: 'Unauthorized',
    };
    res.status(401).json(response);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired token',
        error: 'Forbidden',
      };
      res.status(403).json(response);
      return;
    }

    req.user = user;
    next();
  });
};
