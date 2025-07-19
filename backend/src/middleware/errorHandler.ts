import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/common';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Don't log expected JSON parsing errors during tests
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const isExpectedJsonError = err.type === 'entity.parse.failed' || 
                             (err.name === 'SyntaxError' && err.message.includes('JSON'));
  
  if (!isTestEnvironment || !isExpectedJsonError) {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Payload too large';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong!',
  };

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
  };
  res.status(404).json(response);
};
