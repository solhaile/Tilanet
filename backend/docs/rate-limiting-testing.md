# Rate Limiting Testing Documentation

## Overview

This document explains how rate limiting is implemented and tested in the application.

## Rate Limiting Configuration

### Production Mode
- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 per IP per window
- **Enabled**: Always in production (`NODE_ENV !== 'test'`)

### Test Mode (Default)
- **Rate limiting is DISABLED** to allow proper testing of concurrent requests
- This ensures tests don't interfere with each other due to IP-based rate limiting

## How to Test Rate Limiting

Since rate limiting is disabled in test mode to avoid interference, we test it by creating a **separate Express app instance** with rate limiting explicitly enabled.

### Testing Approach

Create a dedicated test app with rate limiting enabled:

```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import routes from '../src/routes';

// Create test app with rate limiting
const app = express();

const limiter = rateLimit({
  windowMs: 60000, // 1 minute  
  max: 3, // 3 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use('/api', routes);
```

## Rate Limiting Headers

The application uses the new standard rate limiting headers:

- `ratelimit-limit`: Maximum requests allowed in the window
- `ratelimit-remaining`: Remaining requests in current window  
- `ratelimit-reset`: Seconds until the window resets
- `ratelimit-policy`: Policy string (e.g., "3;w=60" = 3 requests per 60 seconds)

## Test Examples

### Basic Rate Limiting Test
```typescript
test('should apply rate limiting', async () => {
  // Make 3 requests (at limit)
  await request(app).get('/api/health').expect(200);
  await request(app).get('/api/health').expect(200); 
  await request(app).get('/api/health').expect(200);

  // Fourth request should be rate limited
  await request(app).get('/api/health').expect(429);
});
```

### Header Verification Test
```typescript
test('should include rate limiting headers', async () => {
  const response = await request(app).get('/api/health');

  expect(response.headers['ratelimit-limit']).toBeDefined();
  expect(response.headers['ratelimit-remaining']).toBeDefined();
  expect(response.headers['ratelimit-reset']).toBeDefined();
});
```

## Why This Approach?

### Benefits
1. **Simple**: No complex app factory or environment variable juggling
2. **Clean Separation**: Normal tests run without rate limiting, dedicated tests verify rate limiting
3. **No Interference**: Rate limiting tests don't affect other tests
4. **Production Safety**: Rate limiting remains active in production

### Production vs Test Behavior
- **Production**: Rate limiting always enabled with production limits (100 req/15min)
- **Test (Normal)**: Rate limiting disabled for all regular tests
- **Test (Rate Limit)**: Separate test suite with dedicated app instance

## Running Tests

```bash
# Run only rate limiting tests
npm test -- tests/rate-limiting.test.ts

# Run all tests (rate limiting disabled by default)  
npm test
```

## Production Deployment

Rate limiting is automatically enabled in production:

```bash
# Production settings (in .env)
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests per IP
```

Rate limiting is controlled by the simple condition: `NODE_ENV !== 'test'`
