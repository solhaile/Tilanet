import { Router } from 'express';
import { OtpController } from '../controllers/otpController';
import { sendOtpValidation, verifyOtpValidation, resendOtpValidation } from '../validators/otpValidator';

const router = Router();
const otpController = new OtpController();

router.post('/send', sendOtpValidation, otpController.sendOtp);
router.post('/verify', verifyOtpValidation, otpController.verifyOtp);
router.post('/resend', resendOtpValidation, otpController.resendOtp);

export { router as otpRoutes };
