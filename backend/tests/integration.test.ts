import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('API Integration Tests', () => {
  describe('System Health', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'API is running',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

          test('should handle very large payloads', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .set('Content-Type', 'application/json')
          .send({ data: 'A'.repeat(1000000) }) // 1MB payload
          .expect(400);

        expect(response.body.success).toBe(false);
      });
  });

  describe('Security Features', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      // Helmet security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBeDefined();
    });
  });

  describe('Request Validation', () => {
    test('should reject requests with invalid content-type for POST', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'text/plain')
        .send('plain text')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle requests with missing content-type', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send('some data')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format Consistency', () => {
          test('should maintain consistent response structure across endpoints', async () => {
        const endpoints = [
          { path: '/api/auth/countries', method: 'GET' },
          { path: '/api/auth/languages', method: 'GET' },
        ];

        for (const endpoint of endpoints) {
          let response;
          if (endpoint.method.toLowerCase() === 'get') {
            response = await request(app).get(endpoint.path).expect(200);
          } else {
            response = await request(app).post(endpoint.path).expect(200);
          }

          expect(response.body).toHaveProperty('success');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('data');
          expect(typeof response.body.success).toBe('boolean');
          expect(typeof response.body.message).toBe('string');
        }
      });

    test('should handle error responses consistently', async () => {
      const errorEndpoints = [
        { path: '/api/nonexistent', expectedStatus: 404 },
        { path: '/api/auth/signup', method: 'POST', body: {}, expectedStatus: 400 },
      ];

      for (const endpoint of errorEndpoints) {
        let response;
        if (endpoint.method?.toLowerCase() === 'post') {
          response = await request(app).post(endpoint.path).send(endpoint.body || {}).expect(endpoint.expectedStatus);
        } else {
          response = await request(app).get(endpoint.path).expect(endpoint.expectedStatus);
        }

        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('message');
        expect(response.body.success).toBe(false);
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('Cross-Origin Resource Sharing', () => {
    test('should handle preflight requests correctly', async () => {
      const response = await request(app)
        .options('/api/auth/signup')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    test('should handle actual CORS requests', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle concurrent requests to different endpoints', async () => {
      const requests = [
        request(app).get('/api/health'),
        request(app).get('/api/auth/countries'),
        request(app).get('/api/auth/languages'),
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('should handle rapid successive requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
