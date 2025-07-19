import { body } from 'express-validator';

export const sendOtpValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
];

export const verifyOtpValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
  
  body('otpCode')
    .notEmpty()
    .withMessage('OTP code is required')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP code must be exactly 6 digits')
    .matches(/^\d{6}$/)
    .withMessage('OTP code must contain only numbers'),
];

export const resendOtpValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
];
