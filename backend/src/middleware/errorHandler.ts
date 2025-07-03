import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/common';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  const response: ApiResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong!',
  };

  const statusCode = err.statusCode || 500;
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
