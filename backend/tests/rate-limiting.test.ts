import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from '../src/routes';
import { errorHandler, notFound } from '../src/middleware/errorHandler';

describe('Rate Limiting Tests', () => {
  
  // Helper function to create a fresh app instance with rate limiting
  const createRateLimitedApp = (maxRequests = 3) => {
    const app = express();
    
    // Security middleware
    app.use(helmet());
    
    // CORS configuration (simplified for testing)
    app.use(cors({ origin: true, credentials: true }));
    
    // Rate limiting with low limits for testing
    const limiter = rateLimit({
      windowMs: 60000, // 1 minute
      max: maxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'Rate limit exceeded',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
    
    // Body parsing middleware
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // API routes
    app.use('/api', routes);
    
    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    return app;
  };

  test('should block requests exceeding rate limit', async () => {
    const app = createRateLimitedApp(3);

    // Make 3 requests to exhaust the limit
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/health').expect(200);

    // Fourth request should be rate limited
    const response = await request(app)
      .get('/api/health')
      .expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many requests');
    expect(response.body.error).toBe('Rate limit exceeded');
  });

  test('should include rate limiting headers', async () => {
    const app = createRateLimitedApp(5);

    const response = await request(app)
      .get('/api/health');

    // Should include rate limiting headers (using new standard format)
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
    expect(response.headers['ratelimit-reset']).toBeDefined();
  });

  test('should rate limit different endpoints together', async () => {
    const app = createRateLimitedApp(3);

    // Use different endpoints but same IP should be rate limited together
    await request(app).get('/api/health').expect(200);
    
    // These will fail validation but should count towards rate limit
    await request(app).post('/api/auth/signup').send({});
    await request(app).post('/api/auth/signin').send({});

    // Fourth request should be rate limited regardless of endpoint
    const response = await request(app)
      .get('/api/health')
      .expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many requests');
  });

  test('should have consistent error response structure when rate limited', async () => {
    const app = createRateLimitedApp(3);

    // Exhaust rate limit
    await request(app).get('/api/health');
    await request(app).get('/api/health');
    await request(app).get('/api/health');

    // Get rate limited response
    const response = await request(app)
      .get('/api/health')
      .expect(429);

    // Verify response structure matches our API standard
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.success).toBe('boolean');
    expect(typeof response.body.message).toBe('string');
    expect(typeof response.body.error).toBe('string');
    expect(response.body.success).toBe(false);
  });
});
