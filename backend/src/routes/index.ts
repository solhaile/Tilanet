import { Router } from 'express';
import authRoutes from './authRoutes';
import { otpRoutes } from './otpRoutes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount OTP routes
router.use('/otp', otpRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
