import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
