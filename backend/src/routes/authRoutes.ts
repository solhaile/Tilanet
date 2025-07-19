import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  signupValidation, 
  signinValidation, 
  otpVerificationValidation,
  refreshTokenValidation,
  updateLanguageValidation,
  resendOtpValidation
} from '../validators/authValidator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (requires OTP verification)
 * @access  Public
 */
router.post('/signup', signupValidation, AuthController.signup);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and activate user account
 * @access  Public
 */
router.post('/verify-otp', otpVerificationValidation, AuthController.verifyOtp);

/**
 * @route   POST /api/auth/signin
 * @desc    Login user (requires verified account)
 * @access  Public
 */
router.post('/signin', signinValidation, AuthController.signin);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', refreshTokenValidation, AuthController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (deactivate session)
 * @access  Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route   GET /api/auth/countries
 * @desc    Get supported countries for signup
 * @access  Public
 */
router.get('/countries', AuthController.getSupportedCountries);

/**
 * @route   GET /api/auth/languages
 * @desc    Get supported languages
 * @access  Public
 */
router.get('/languages', AuthController.getSupportedLanguages);

/**
 * @route   PUT /api/auth/language
 * @desc    Update user's preferred language
 * @access  Private
 */
router.put('/language', authenticateToken, updateLanguageValidation, AuthController.updateLanguage);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user's phone number
 * @access  Public
 */
router.post('/resend-otp', resendOtpValidation, AuthController.resendOtp);

export default router;
