import { body } from 'express-validator';
import { LocaleService } from '../services/localeService';

export const signupValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\u00C0-\u017F\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\u00C0-\u017F\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('countryCode')
    .notEmpty()
    .withMessage('Country code is required')
    .trim()
    .custom((value) => {
      if (!LocaleService.validateCountryCode(value)) {
        throw new Error('Invalid country code');
      }
      return true;
    }),
  
  body('preferredLanguage')
    .notEmpty()
    .withMessage('Language preference is required')
    .trim()
    .isIn(['en', 'am'])
    .withMessage('Language must be either "en" or "am"'),
  
  body('phone')
    .custom((value, { req }) => {
      const countryCode = req.body.countryCode;
      if (countryCode && !LocaleService.validatePhoneNumber(value, countryCode)) {
        throw new Error('Phone number format is invalid for the selected country');
      }
      return true;
    }),
];

export const signinValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const otpVerificationValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
  
  body('otpCode')
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP code must be exactly 6 digits')
    .matches(/^\d{6}$/)
    .withMessage('OTP code must contain only numbers'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 128, max: 128 })
    .withMessage('Invalid refresh token format'),
];

export const updateLanguageValidation = [
  body('language')
    .notEmpty()
    .withMessage('Language is required')
    .trim()
    .isIn(['en', 'am'])
    .withMessage('Language must be either "en" or "am"'),
];

export const resendOtpValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number (e.g., +1234567890)'),
];
