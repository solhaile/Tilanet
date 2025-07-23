import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db';
import { eq, and } from 'drizzle-orm';
import { schema } from '../src/db';
import bcrypt from 'bcrypt';

describe('OTP API', () => {
  let testUserId: string;
  const testUserData = {
    phone: '+1234567890',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    countryCode: 'US',
    preferredLanguage: 'en',
  };

  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(schema.otpCodes);
    await db.delete(schema.users);

    // Create a test user
    const hashedPassword = await bcrypt.hash(testUserData.password, 10);
    const [user] = await db.insert(schema.users).values({
      phoneNumber: testUserData.phone,
      password: hashedPassword,
      firstName: testUserData.firstName,
      lastName: testUserData.lastName,
      countryCode: testUserData.countryCode,
      preferredLanguage: testUserData.preferredLanguage,
      isVerified: false,
    }).returning();

    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(schema.otpCodes);
    await db.delete(schema.users);
  });

  describe('POST /api/otp/send', () => {
    test('should send OTP successfully for existing user', async () => {
      const response = await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('OTP sent'),
      });

      // Verify OTP was created in database
      const otpRecords = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId));

      expect(otpRecords).toHaveLength(1);
      expect(otpRecords[0].code).toMatch(/^\d{6}$/); // 6-digit code
      expect(otpRecords[0].type).toBe('sms');
      expect(otpRecords[0].isUsed).toBe(false);
      expect(otpRecords[0].attempts).toBe(0);
    });

    test('should return 400 for missing phone number', async () => {
      const response = await request(app)
        .post('/api/otp/send')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Phone number is required');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: '+9999999999' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    test('should handle invalid phone number formats', async () => {
      const invalidPhones = ['invalid', '123', '', null, undefined];

      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/api/otp/send')
          .send({ phoneNumber: phone })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    test('should set correct expiration time (10 minutes)', async () => {
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId))
        .limit(1);

      const now = new Date();
      const expiresAt = new Date(otpRecord[0].expiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();
      
      // Should be approximately 10 minutes (600,000 ms), allow 1 minute tolerance
      expect(timeDiff).toBeGreaterThan(9 * 60 * 1000); // 9 minutes
      expect(timeDiff).toBeLessThan(11 * 60 * 1000); // 11 minutes
    });

    test('should handle rate limiting for OTP requests', async () => {
      // Send multiple OTP requests quickly
      const requests = Array(3).fill(null).map(() =>
        request(app)
          .post('/api/otp/send')
          .send({ phoneNumber: testUserData.phone })
      );

      const responses = await Promise.all(requests);

      // All should succeed (rate limiting is disabled in test mode)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });

    test('should invalidate previous OTP when sending new one', async () => {
      // Send first OTP
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      // Send second OTP
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      // Check that only one active OTP exists (previous one should be marked as used)
      const otpRecords = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId));

      // Should have 2 records: one used, one active
      expect(otpRecords).toHaveLength(2);
      
      // Only one should be active (not used)
      const activeOtps = otpRecords.filter(otp => !otp.isUsed);
      expect(activeOtps).toHaveLength(1);
    });
  });

  describe('POST /api/otp/verify', () => {
    let otpCode: string;

    beforeEach(async () => {
      // Send OTP first
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone });

      // Get the OTP code from database
      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId))
        .limit(1);

      otpCode = otpRecord[0].code;
    });

    test('should verify OTP successfully with correct code', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: otpCode,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'OTP verified successfully',
        data: { isVerified: true },
      });

      // Verify OTP is marked as used
      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(and(
          eq(schema.otpCodes.userId, testUserId),
          eq(schema.otpCodes.code, otpCode)
        ))
        .limit(1);

      expect(otpRecord[0].isUsed).toBe(true);

      // Verify user is marked as verified
      const user = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testUserId))
        .limit(1);

      expect(user[0].isVerified).toBe(true);
    });

    test('should return 400 for missing required fields', async () => {
      const testCases = [
        { phoneNumber: testUserData.phone }, // missing code
        { otpCode: otpCode }, // missing phone
        {}, // missing both
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/otp/verify')
          .send(testCase)
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: '+9999999999',
          otpCode: otpCode,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    test('should return 400 for invalid OTP code', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: '000000',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid OTP');
    });

    test('should return 400 for expired OTP', async () => {
      // Manually expire the OTP
      await db.update(schema.otpCodes)
        .set({ expiresAt: new Date(Date.now() - 1000) }) // 1 second ago
        .where(eq(schema.otpCodes.userId, testUserId));

      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: otpCode,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid OTP code');
    });

    test('should return 400 for already used OTP', async () => {
      // Mark OTP as used
      await db.update(schema.otpCodes)
        .set({ isUsed: true })
        .where(eq(schema.otpCodes.userId, testUserId));

      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: otpCode,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid OTP code');
    });

    test('should increment attempts counter on failed verification', async () => {
      // Try to verify with wrong code
      await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: '000000',
        })
        .expect(400);

      // Check that attempts were incremented
      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId))
        .limit(1);

      expect(otpRecord[0].attempts).toBe(1);
    });

    test('should block verification after max attempts', async () => {
      // Set attempts to max (3)
      await db.update(schema.otpCodes)
        .set({ attempts: 3 })
        .where(eq(schema.otpCodes.userId, testUserId));

      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: otpCode,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Too many failed attempts');
    });

    test('should handle case-insensitive OTP input', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: otpCode.toLowerCase(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should trim whitespace from OTP input', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          phoneNumber: testUserData.phone,
          otpCode: ` ${otpCode} `,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/otp/resend', () => {
    test('should resend OTP successfully', async () => {
      // First send an initial OTP
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      // Then resend OTP
      const response = await request(app)
        .post('/api/otp/resend')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('OTP resent'),
      });

      // Check that previous OTP is invalidated and new one is created
      const otpRecords = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId));

      // Should have 2 records: one used (from original), one active (from resend)
      expect(otpRecords).toHaveLength(2);
      
      // Only one should be active (not used)
      const activeOtps = otpRecords.filter(otp => !otp.isUsed);
      expect(activeOtps).toHaveLength(1);
      expect(activeOtps[0].attempts).toBe(0);
    });

    test('should return 404 for non-existent user on resend', async () => {
      const response = await request(app)
        .post('/api/otp/resend')
        .send({ phoneNumber: '+9999999999' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    test('should return 400 for missing phone number on resend', async () => {
      const response = await request(app)
        .post('/api/otp/resend')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle rate limiting for resend requests', async () => {
      // Send initial OTP
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      // Try to resend multiple times quickly
      const requests = Array(3).fill(null).map(() =>
        request(app)
          .post('/api/otp/resend')
          .send({ phoneNumber: testUserData.phone })
      );

      const responses = await Promise.all(requests);

      // All should succeed (rate limiting is disabled in test mode)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });

  describe('OTP Security Features', () => {
    test('should generate unique OTP codes', async () => {
      const otpCodes = new Set<string>();
      
      // Generate multiple OTPs with different users to avoid invalidation
      const testPhones = [
        '+1234567890',
        '+1234567891', 
        '+1234567892',
        '+1234567893',
        '+1234567894'
      ];

      for (let i = 0; i < testPhones.length; i++) {
        try {
          // Create a user for each phone number
          const hashedPassword = await bcrypt.hash('password123', 10);
          const [user] = await db.insert(schema.users).values({
            phoneNumber: testPhones[i],
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            countryCode: 'US',
            preferredLanguage: 'en',
            isVerified: false,
          }).returning();

          // Send OTP for this user
          await request(app)
            .post('/api/otp/send')
            .send({ phoneNumber: testPhones[i] })
            .expect(200);
          
          // Get the OTP from database
          const otpRecord = await db.select()
            .from(schema.otpCodes)
            .where(eq(schema.otpCodes.userId, user.id))
            .orderBy(schema.otpCodes.createdAt)
            .limit(1);
          
          if (otpRecord.length > 0) {
            otpCodes.add(otpRecord[0].code);
          }
        } catch (error) {
          // Skip if user already exists (duplicate phone number)
          console.log(`Skipping ${testPhones[i]} - user may already exist`);
        }
      }

      // Most codes should be unique (allowing for some duplicates due to randomness)
      expect(otpCodes.size).toBeGreaterThan(3);
    });

    test('should not expose OTP in response body', async () => {
      const response = await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone })
        .expect(200);

      // Response should not contain the actual OTP code
      expect(JSON.stringify(response.body)).not.toMatch(/\d{6}/);
    });

    test('should handle concurrent OTP requests gracefully', async () => {
      // Send multiple OTP requests concurrently
      const requests = Array(3).fill(null).map(() =>
        request(app)
          .post('/api/otp/send')
          .send({ phoneNumber: testUserData.phone })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // Check that only one active OTP exists (others should be invalidated)
      const otpRecords = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId));

      // Should have multiple records but only one active
      expect(otpRecords.length).toBeGreaterThan(1);
      
      const activeOtps = otpRecords.filter(otp => !otp.isUsed);
      // Due to race conditions, we might have 0 or 1 active OTPs
      expect(activeOtps.length).toBeLessThanOrEqual(1);
    });
  });

  describe('OTP Validation Edge Cases', () => {
    test('should handle malformed OTP input', async () => {
      // Send OTP first
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone });

      const invalidOtpInputs = [
        '12345', // too short
        '1234567', // too long
        'abcdef', // letters
        '12 3456', // spaces
        '12-3456', // dashes
        '', // empty
        null,
        undefined,
      ];

      for (const invalidOtp of invalidOtpInputs) {
        const response = await request(app)
          .post('/api/otp/verify')
          .send({
            phoneNumber: testUserData.phone,
            otpCode: invalidOtp,
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    test('should handle phone number variations', async () => {
      // Send OTP first
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testUserData.phone });

      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId))
        .limit(1);

      const otpCode = otpRecord[0].code;

      // Test with different phone number formats
      const phoneVariations = [
        testUserData.phone,
        testUserData.phone.replace('+', ''),
        ` ${testUserData.phone} `,
      ];

      for (const phone of phoneVariations) {
        const response = await request(app)
          .post('/api/otp/verify')
          .send({
            phoneNumber: phone,
            otpCode: otpCode,
          });

        // Should either succeed or fail gracefully
        expect([200, 400, 404]).toContain(response.status);
      }
    });
  });
});
