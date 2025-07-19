import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('Health API', () => {
  describe('GET /api/health', () => {
    test('should return 200 with health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'API is running',
        timestamp: expect.any(String),
      });

      // Verify timestamp is a valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    test('should include proper response headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBeDefined();
    });

    test('should return consistent response structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
    });

    test('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/health')
          .expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('API is running');
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeTruthy();
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle very large payloads', async () => {
      const largePayload = 'A'.repeat(1000000); // 1MB payload

      const response = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send({ data: largePayload })
        .expect(404); // Health endpoint doesn't accept POST

      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Features', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

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

    test('should not expose sensitive information in error responses', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      // Should not expose internal details
      expect(response.body.message).not.toContain('stack');
      expect(response.body.message).not.toContain('error');
      expect(response.body.message).not.toContain('internal');
    });
  });

  describe('Request Validation', () => {
    test('should reject requests with invalid content-type for POST', async () => {
      const response = await request(app)
        .post('/api/health')
        .set('Content-Type', 'text/plain')
        .send('plain text')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should handle requests with missing content-type', async () => {
      const response = await request(app)
        .post('/api/health')
        .send('some data')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
