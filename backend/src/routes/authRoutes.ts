import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { signupValidation, signinValidation } from '../validators/authValidator';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, AuthController.signup);

/**
 * @route   POST /api/auth/signin
 * @desc    Login user
 * @access  Public
 */
router.post('/signin', signinValidation, AuthController.signin);

export default router;
