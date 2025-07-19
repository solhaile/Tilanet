import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils';
import { ApiResponse } from '../types/common';
import { TokenPayload } from '../types/auth';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  idirId?: string; // For future multi-tenancy support
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

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token',
      error: 'Forbidden',
    };
    res.status(403).json(response);
  }
};

// Middleware to check if user is verified
export const requireVerifiedUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'Unauthorized',
    };
    res.status(401).json(response);
    return;
  }

  // Note: isVerified status is not stored in JWT for security
  // This should be checked against the database in specific endpoints
  // that require verification status
  next();
};

// Middleware to extract user language preference
export const withUserLanguage = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.preferredLanguage) {
    // Set language context for the request
    req.headers['accept-language'] = req.user.preferredLanguage;
  }
  next();
};
