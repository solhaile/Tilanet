import { SmsClient } from '@azure/communication-sms';
import { db, schema } from '../db';
import { eq, and, gt, sql, lt } from 'drizzle-orm';
import logger from '../utils/logger';
import crypto from 'crypto';

export class OtpService {
  private smsClient: SmsClient | null;
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor() {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    if (connectionString) {
      this.smsClient = new SmsClient(connectionString);
    } else {
      this.smsClient = null;
      logger.warn('Azure Communication Services connection string not configured');
    }
  }

  // Generate 6-digit OTP
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Invalidate all existing OTPs for a user
  private async invalidateExistingOtps(userId: string): Promise<void> {
    await db.update(schema.otpCodes)
      .set({ isUsed: true })
      .where(and(
        eq(schema.otpCodes.userId, userId),
        eq(schema.otpCodes.isUsed, false)
      ));
  }

  // Check if user has reached max attempts
  private async checkMaxAttempts(userId: string): Promise<boolean> {
    const otpRecord = await db.select()
      .from(schema.otpCodes)
      .where(and(
        eq(schema.otpCodes.userId, userId),
        eq(schema.otpCodes.isUsed, false),
        gt(schema.otpCodes.expiresAt, new Date())
      ))
      .orderBy(schema.otpCodes.createdAt)
      .limit(1);

    if (otpRecord.length > 0 && otpRecord[0].attempts >= this.MAX_ATTEMPTS) {
      return true;
    }
    return false;
  }

  // Send SMS OTP
  async sendSmsOtp(userId: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has reached max attempts
      const hasMaxAttempts = await this.checkMaxAttempts(userId);
      if (hasMaxAttempts) {
        return { 
          success: false, 
          message: 'Too many failed attempts. Please wait before requesting a new OTP.' 
        };
      }

      // Invalidate existing OTPs
      await this.invalidateExistingOtps(userId);

      const code = this.generateOtpCode();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in database
      await db.insert(schema.otpCodes).values({
        userId,
        code,
        type: 'sms',
        phoneNumber,
        expiresAt,
        attempts: 0,
      });

      // In test mode or when USE_MOCK_OTP is true, don't actually send SMS
      if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_OTP === 'true') {
        logger.info(`OTP for ${phoneNumber}: ${code} (Development mode - Azure not configured)`);
        return { 
          success: true, 
          message: `OTP sent via SMS (Development mode - check logs for code)` 
        };
      }

      // Send SMS if Azure is configured
      if (this.smsClient && process.env.AZURE_COMMUNICATION_PHONE_NUMBER) {
        try {
          const sendResults = await this.smsClient.send({
            from: process.env.AZURE_COMMUNICATION_PHONE_NUMBER,
            to: [phoneNumber],
            message: `Your Tilanet verification code is: ${code}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`,
          });

          const result = sendResults[0];
          if (result.successful) {
            logger.info(`SMS OTP sent successfully to ${phoneNumber}`);
            return { success: true, message: 'OTP sent via SMS' };
          } else {
            logger.error(`Failed to send SMS OTP: ${result.errorMessage}`);
            // Fallback to voice call
            return await this.sendVoiceOtp(userId, phoneNumber, code);
          }
        } catch (error) {
          logger.error('Error sending SMS OTP:', error);
          // Fallback to voice call
          return await this.sendVoiceOtp(userId, phoneNumber, code);
        }
      } else {
        // For development/testing - log the OTP code
        logger.info(`OTP for ${phoneNumber}: ${code} (Development mode - Azure not configured)`);
        return { 
          success: true, 
          message: `OTP sent via SMS (Development mode - check logs for code)` 
        };
      }
    } catch (error) {
      logger.error('Error in sendSmsOtp:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  // Send Voice OTP (fallback)
  async sendVoiceOtp(userId: string, phoneNumber: string, existingCode?: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = existingCode || this.generateOtpCode();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      if (!existingCode) {
        // Invalidate existing OTPs
        await this.invalidateExistingOtps(userId);
        
        // Store new OTP in database
        await db.insert(schema.otpCodes).values({
          userId,
          code,
          type: 'voice',
          phoneNumber,
          expiresAt,
          attempts: 0,
        });
      } else {
        // Update existing OTP to voice type
        await db.update(schema.otpCodes)
          .set({ type: 'voice' })
          .where(and(
            eq(schema.otpCodes.userId, userId),
            eq(schema.otpCodes.code, code),
            eq(schema.otpCodes.isUsed, false)
          ));
      }

      // In a real implementation, you would use Azure Communication Services Calling API
      // For now, we'll simulate voice call success and log the code
      logger.info(`Voice OTP for ${phoneNumber}: ${code} (Development mode - would be called)`);
      
      return { 
        success: true, 
        message: 'OTP sent via voice call (Development mode - check logs for code)' 
      };
    } catch (error) {
      logger.error('Error sending voice OTP:', error);
      return { 
        success: false, 
        message: 'Failed to send OTP via SMS and voice' 
      };
    }
  }

  // Verify OTP
  async verifyOtp(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Trim whitespace from code
      const trimmedCode = code.trim();

      // Get all OTP records for this user and code in a single query to prevent timing attacks
      const allOtpRecords = await db.select()
        .from(schema.otpCodes)
        .where(and(
          eq(schema.otpCodes.userId, userId),
          eq(schema.otpCodes.code, trimmedCode)
        ))
        .orderBy(schema.otpCodes.createdAt)
        .limit(5); // Limit to prevent excessive processing

      // Always increment attempts for the most recent valid OTP to prevent timing attacks
      await db.update(schema.otpCodes)
        .set({ 
          attempts: sql`${schema.otpCodes.attempts} + 1`
        })
        .where(and(
          eq(schema.otpCodes.userId, userId),
          eq(schema.otpCodes.isUsed, false),
          gt(schema.otpCodes.expiresAt, new Date())
        ));

      // Check records to determine the appropriate response
      let latestValidOtp = null;
      let hasExpiredOtp = false;
      let hasUsedOtp = false;

      for (const record of allOtpRecords) {
        if (record.isUsed) {
          hasUsedOtp = true;
        } else if (record.expiresAt <= new Date()) {
          hasExpiredOtp = true;
        } else {
          latestValidOtp = record;
          break; // Use the first valid OTP found
        }
      }

      // Determine response based on OTP state
      if (!latestValidOtp) {
        if (hasUsedOtp) {
          return { success: false, message: 'Invalid OTP code' };
        } else if (hasExpiredOtp) {
          return { success: false, message: 'Invalid OTP code' };
        } else {
          return { success: false, message: 'Invalid OTP code' };
        }
      }

      // Check if OTP has reached max attempts
      if (latestValidOtp.attempts >= this.MAX_ATTEMPTS) {
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }

      // Mark OTP as used
      await db.update(schema.otpCodes)
        .set({ isUsed: true })
        .where(eq(schema.otpCodes.id, latestValidOtp.id));

      // Mark user as verified
      await db.update(schema.users)
        .set({ isVerified: true })
        .where(eq(schema.users.id, userId));

      logger.info(`OTP verified successfully for user ${userId}`);
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return { success: false, message: 'Error verifying OTP' };
    }
  }

  // Resend OTP
  async resendOtp(userId: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has reached max attempts
      const hasMaxAttempts = await this.checkMaxAttempts(userId);
      if (hasMaxAttempts) {
        return { 
          success: false, 
          message: 'Too many failed attempts. Please wait before requesting a new OTP.' 
        };
      }

      // Invalidate previous OTPs
      await this.invalidateExistingOtps(userId);

      // Send new OTP
      const result = await this.sendSmsOtp(userId, phoneNumber);
      
      if (result.success) {
        return { 
          success: true, 
          message: 'OTP resent successfully' 
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Error resending OTP:', error);
      return { success: false, message: 'Error resending OTP' };
    }
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOtps(): Promise<void> {
    try {
      await db.delete(schema.otpCodes)
        .where(lt(schema.otpCodes.expiresAt, new Date()));
      
      logger.info('Expired OTPs cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up expired OTPs:', error);
    }
  }
}
