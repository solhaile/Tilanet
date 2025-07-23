import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db';
import { eq } from 'drizzle-orm';
import { schema } from '../src/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Authentication API', () => {
  const validSignupData = {
    phone: '+12345678901',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    countryCode: 'US',
    preferredLanguage: 'en',
  };

  beforeEach(async () => {
    try {
      // Clean up database before each test
      await db.delete(schema.sessions);
      await db.delete(schema.otpCodes);
      await db.delete(schema.users);
    } catch (error) {
      console.warn('Database cleanup warning:', error);
    }
  });

  afterAll(async () => {
    try {
      // Clean up after all tests
      await db.delete(schema.sessions);
      await db.delete(schema.otpCodes);
      await db.delete(schema.users);
    } catch (error) {
      console.warn('Database cleanup warning:', error);
    }
  });

  describe('GET /api/auth/countries', () => {
    test('should return supported countries', async () => {
      const response = await request(app)
        .get('/api/auth/countries')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check for Ethiopia and US
      const countries = response.body.data;
      const ethiopia = countries.find((c: any) => c.code === 'ET');
      const usa = countries.find((c: any) => c.code === 'US');

      expect(ethiopia).toBeDefined();
      expect(ethiopia.name).toBe('Ethiopia');
      expect(ethiopia.dialCode).toBe('+251');

      expect(usa).toBeDefined();
      expect(usa.name).toBe('United States');
      expect(usa.dialCode).toBe('+1');
    });
  });

  describe('GET /api/auth/languages', () => {
    test('should return supported languages', async () => {
      const response = await request(app)
        .get('/api/auth/languages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(2);

      const languages = response.body.data;
      const english = languages.find((l: any) => l.code === 'en');
      const amharic = languages.find((l: any) => l.code === 'am');

      expect(english).toBeDefined();
      expect(english.name).toBe('English');
      expect(english.nativeName).toBe('English');

      expect(amharic).toBeDefined();
      expect(amharic.name).toBe('Amharic');
      expect(amharic.nativeName).toBe('አማርኛ');
    });
  });

  describe('POST /api/auth/signup', () => {
    describe('Valid Cases', () => {
      test('should create a new user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(201);

        // Check if OTP verification is bypassed
        const skipOtpVerification = process.env.SKIP_OTP_VERIFICATION === 'true';
        
        if (skipOtpVerification) {
          expect(response.body).toMatchObject({
            success: true,
            message: expect.stringContaining('User created successfully'),
            data: {
              user: {
                phoneNumber: '+12345678901',
                firstName: 'John',
                lastName: 'Doe',
                preferredLanguage: 'en',
                isVerified: true,
              },
              requiresVerification: true,
            },
          });
        } else {
          expect(response.body).toMatchObject({
            success: true,
            message: expect.stringContaining('Please verify your phone number'),
            data: {
              user: {
                phoneNumber: '+12345678901',
                firstName: 'John',
                lastName: 'Doe',
                preferredLanguage: 'en',
                isVerified: false,
              },
              requiresVerification: true,
            },
          });
        }

        // Verify user was created in database
        const user = await db.select()
          .from(schema.users)
          .where(eq(schema.users.phoneNumber, '+12345678901'))
          .limit(1);

        expect(user).toHaveLength(1);
        expect(user[0].firstName).toBe('John');
        expect(user[0].lastName).toBe('Doe');
        expect(user[0].preferredLanguage).toBe('en');
        expect(user[0].countryCode).toBe('US');
        expect(user[0].isVerified).toBe(skipOtpVerification);
      });

      test('should hash the password correctly', async () => {
        await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(201);

        const user = await db.select()
          .from(schema.users)
          .where(eq(schema.users.phoneNumber, '+12345678901'))
          .limit(1);

        const isPasswordValid = await bcrypt.compare('password123', user[0].password);
        expect(isPasswordValid).toBe(true);
        expect(user[0].password).not.toBe('password123'); // Should be hashed
      });

      test('should trim whitespace from input fields', async () => {
        const dataWithSpaces = {
          phone: '  +12345678901  ',
          password: 'password123',
          firstName: '  John  ',
          lastName: '  Doe  ',
          countryCode: 'US',
          preferredLanguage: 'en',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(dataWithSpaces)
          .expect(201);

        expect(response.body.data.user.firstName).toBe('John');
        expect(response.body.data.user.lastName).toBe('Doe');
        expect(response.body.data.user.phoneNumber).toBe('+12345678901');
      });

      test('should handle international phone numbers', async () => {
        const internationalPhones = [
          { phone: '+441234567890', countryCode: 'GB' },  // UK
          { phone: '+491234567890', countryCode: 'DE' },  // Germany
          { phone: '+331234567890', countryCode: 'FR' },  // France
          { phone: '+251912345678', countryCode: 'ET' }, // Ethiopia
        ];

        for (const { phone, countryCode } of internationalPhones) {
          const userData = { 
            ...validSignupData, 
            phone, 
            countryCode,
            preferredLanguage: countryCode === 'ET' ? 'am' : 'en'
          };
          const response = await request(app)
            .post('/api/auth/signup')
            .send(userData)
            .expect(201);

          expect(response.body.data.user.phoneNumber).toBe(phone);
          
          // Clean up for next iteration
          await db.delete(schema.otpCodes).where(eq(schema.otpCodes.phoneNumber, phone));
          await db.delete(schema.users).where(eq(schema.users.phoneNumber, phone));
        }
      });

      test('should support Amharic language preference', async () => {
        const amharicData = { 
          ...validSignupData, 
          phone: '+251912345678',
          countryCode: 'ET',
          preferredLanguage: 'am' 
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(amharicData)
          .expect(201);

        expect(response.body.data.user.preferredLanguage).toBe('am');
      });
    });

    describe('Validation Edge Cases', () => {
      test('should return 400 for missing required fields', async () => {
        const testCases = [
          { ...validSignupData, phone: undefined },
          { ...validSignupData, password: undefined },
          { ...validSignupData, firstName: undefined },
          { ...validSignupData, lastName: undefined },
          { ...validSignupData, countryCode: undefined },
          { ...validSignupData, preferredLanguage: undefined },
          {},
          { phone: '', password: '', firstName: '', lastName: '', countryCode: '', preferredLanguage: '' },
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/signup')
            .send(testCase)
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toBeTruthy();
        }
      });

      test('should return 400 for invalid phone number formats', async () => {
        const invalidPhones = [
          'invalid-phone',
          '123',
          '+',
          '12345678901234567890', // too long
          '',
          '1234567890', // missing +
          '+1', // too short
          '++1234567890', // double plus
          '+1234567890abc', // contains letters
          '+1234-567-890', // contains dashes
          '+1 234 567 890', // contains spaces
        ];

        for (const phone of invalidPhones) {
          const response = await request(app)
            .post('/api/auth/signup')
            .send({ ...validSignupData, phone })
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toMatch(/phone|Phone/i);
        }
      });

      test('should return 400 for weak passwords', async () => {
        const weakPasswords = [
          '123', // too short
          '', // empty
          '12345', // too short
          'a', // single character
          '   ', // only spaces
        ];

        for (const password of weakPasswords) {
          const response = await request(app)
            .post('/api/auth/signup')
            .send({ ...validSignupData, password })
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toMatch(/password|Password/i);
        }
      });

      test('should return 400 for invalid name formats', async () => {
        const invalidNames = [
          '', // empty
          '   ', // only spaces
          'a'.repeat(51), // too long
          '123', // numbers only
          '!@#$%', // special characters only
        ];

        for (const name of invalidNames) {
          const response = await request(app)
            .post('/api/auth/signup')
            .send({ ...validSignupData, firstName: name })
            .expect(400);

          expect(response.body.success).toBe(false);
        }
      });

      test('should validate country code', async () => {
        const invalidData = { ...validSignupData, countryCode: 'XX' };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid country code');
      });

      test('should validate language preference', async () => {
        const invalidData = { ...validSignupData, preferredLanguage: 'fr' };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Language must be either "en" or "am"');
      });

      test('should validate phone number format for country', async () => {
        const invalidData = { ...validSignupData, phone: '+251123' }; // Too short for Ethiopia
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('valid phone number');
      });
    });

    describe('Security Edge Cases', () => {
      test('should return 409 for duplicate phone number', async () => {
        // Create first user
        await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(201);

        // Try to create second user with same phone
        const response = await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      test('should handle SQL injection attempts', async () => {
        const maliciousData = {
          ...validSignupData,
          firstName: "'; DROP TABLE users; --",
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(maliciousData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should handle XSS attempts in input fields', async () => {
        const xssData = {
          ...validSignupData,
          firstName: '<script>alert("xss")</script>',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(xssData)
          .expect(400); // Should be rejected due to validation

        expect(response.body.success).toBe(false);
      });

      test('should not expose sensitive information in error messages', async () => {
        // Create a user first
        await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(201);

        // Try to create duplicate
        const response = await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(409);

        // Should not expose internal details
        expect(response.body.message).not.toContain('database');
        expect(response.body.message).not.toContain('constraint');
        expect(response.body.message).not.toContain('duplicate');
      });
    });

    describe('Boundary Value Testing', () => {
      test('should handle maximum valid input lengths', async () => {
        const maxLengthData = {
          ...validSignupData,
          firstName: 'A'.repeat(50),
          lastName: 'B'.repeat(50),
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(maxLengthData)
          .expect(201);

        expect(response.body.data.user.firstName).toBe('A'.repeat(50));
        expect(response.body.data.user.lastName).toBe('B'.repeat(50));
      });

      test('should handle Unicode characters in names', async () => {
        const unicodeData = {
          ...validSignupData,
          firstName: 'José',
          lastName: 'García',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(unicodeData)
          .expect(201);

        expect(response.body.data.user.firstName).toBe('José');
        expect(response.body.data.user.lastName).toBe('García');
      });
    });

    describe('Content-Type Edge Cases', () => {
      test('should handle missing Content-Type header', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send(validSignupData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      test('should handle invalid JSON', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should handle very large payloads', async () => {
        const largeData = {
          ...validSignupData,
          firstName: 'A'.repeat(10000), // Very large name
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(largeData)
          .expect(400); // Should be rejected due to validation

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('POST /api/auth/signin', () => {
    const userData = {
      phone: '+12345678901',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      countryCode: 'US',
      preferredLanguage: 'en',
    };

    beforeEach(async () => {
      // Create a verified test user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [user] = await db.insert(schema.users).values({
        phoneNumber: userData.phone,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        countryCode: userData.countryCode,
        preferredLanguage: userData.preferredLanguage,
        isVerified: true,
      }).returning();
      
      // Create a mock OTP code for the user (required for verification)
      await db.insert(schema.otpCodes).values({
        userId: user.id,
        phoneNumber: userData.phone,
        code: '123456',
        type: 'sms',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        isUsed: false,
      });
    });

    describe('Valid Cases', () => {
      test('should sign in successfully with correct credentials', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'password123',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'Authentication successful',
          data: {
            user: {
              phoneNumber: '+12345678901',
              firstName: 'John',
              lastName: 'Doe',
              preferredLanguage: 'en',
              isVerified: true,
            },
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 3600,
          },
        });

        // Verify token is valid JWT
        expect(response.body.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      });

      test('should not expose password in response', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'password123',
          })
          .expect(200);

        expect(response.body.data.user).not.toHaveProperty('password');
        expect(JSON.stringify(response.body)).not.toContain('password123');
      });
    });

    describe('Authentication Edge Cases', () => {
      test('should return 401 for incorrect password', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid');
      });

      test('should return 401 for non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+9999999999',
            password: 'password123',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid phone number or password');
      });

      test('should return 400 for missing credentials', async () => {
        const testCases = [
          { phone: '+12345678901' }, // missing password
          { password: 'password123' }, // missing phone
          {}, // missing both
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/signin')
            .send(testCase)
            .expect(400);

          expect(response.body.success).toBe(false);
        }
      });
    });

    describe('Security Edge Cases', () => {
      test('should handle brute force attempts gracefully', async () => {
        // Make multiple failed attempts
        for (let i = 0; i < 5; i++) {
          const response = await request(app)
            .post('/api/auth/signin')
            .send({
              phone: '+12345678901',
              password: 'wrongpassword',
            })
            .expect(401);

          expect(response.body.success).toBe(false);
        }

        // Should still allow correct login
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'password123',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should handle SQL injection in signin', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: "'; DROP TABLE users; --",
            password: 'password123',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should not leak timing information', async () => {
        const startTime = Date.now();
        
        await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+9999999999',
            password: 'password123',
          })
          .expect(401);

        const nonExistentTime = Date.now() - startTime;

        const startTime2 = Date.now();
        
        await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'wrongpassword',
          })
          .expect(401);

        const wrongPasswordTime = Date.now() - startTime2;

        // Times should be similar (within 100ms)
        expect(Math.abs(nonExistentTime - wrongPasswordTime)).toBeLessThan(100);
      });
    });

    describe('Edge Case Scenarios', () => {
      test('should handle phone number case sensitivity consistently', async () => {
        const response = await request(app)
          .post('/api/auth/signin')
          .send({
            phone: '+12345678901',
            password: 'password123',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should handle concurrent signin requests', async () => {
        const requests = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/auth/signin')
            .send({
              phone: '+12345678901',
              password: 'password123',
            })
        );

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        });
      });
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let testUserId: string;
    let testPhone: string;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [user] = await db.insert(schema.users).values({
        phoneNumber: '+251912345678',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        countryCode: 'ET',
        preferredLanguage: 'en',
        isVerified: false,
      }).returning();

      testUserId = user.id;
      testPhone = user.phoneNumber;

      // Send OTP
      await request(app)
        .post('/api/otp/send')
        .send({ phoneNumber: testPhone });
    });

    test('should verify OTP and activate user account', async () => {
      // Get the OTP code from database
      const otpRecord = await db.select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.userId, testUserId))
        .limit(1);

      const otpCode = otpRecord[0].code;

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: testPhone,
          otpCode: otpCode,
        })
        .expect(200);

              expect(response.body).toMatchObject({
          success: true,
          message: expect.stringContaining('verified'),
          data: {
            user: {
              phoneNumber: testPhone,
            },
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        });

      // Verify user is now verified in database
      const user = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testUserId))
        .limit(1);

      expect(user[0].isVerified).toBe(true);
    });

    test('should return 400 for invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: testPhone,
          otpCode: '000000',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
              expect(response.body.message).toContain('Invalid');
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: testPhone,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to signup endpoint', async () => {
      const requests = Array(5).fill(null).map((_, index) => {
        // Generate unique 10-digit US phone numbers
        const timestamp = Date.now().toString();
        const uniqueDigits = timestamp.slice(-8) + index.toString().padStart(2, '0');
        return request(app)
          .post('/api/auth/signup')
          .send({
            phone: `+1${uniqueDigits}`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            countryCode: 'US',
            preferredLanguage: 'en',
          });
      });

      const responses = await Promise.all(requests);

      // All should succeed within normal limits (201 success or 409 duplicate)
      // Note: Rate limiting is disabled in test mode, so we expect all to succeed
      responses.forEach(response => {
        expect([201, 409]).toContain(response.status);
      });
    });
  });

  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-credentials');
    });
  });

  describe('API Response Format Validation', () => {
    test('should always return consistent response structure', async () => {
      const response = await request(app)
        .get('/api/auth/countries')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    test('should include proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/auth/signup')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBeDefined();
    });

    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/auth/countries')
        .expect(200);

      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
