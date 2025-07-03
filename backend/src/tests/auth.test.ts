import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        phone: '+1234567890',
        password: 'TestPass123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.phone).toBe(userData.phone);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        phone: 'invalid-phone',
        password: '123',
        firstName: '',
        lastName: '',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a user for signin tests
      const userData = {
        phone: '+1987654321',
        password: 'TestPass123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        phone: '+1987654321',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const invalidLogin = {
        phone: '+1987654321',
        password: 'WrongPassword',
      };

      const response = await request(app)
        .post('/api/auth/signin')
        .send(invalidLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid phone number or password');
    });
  });
});
