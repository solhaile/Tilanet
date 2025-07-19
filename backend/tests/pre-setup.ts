// Pre-test setup that runs before Jest starts
// This ensures environment variables are set before any modules are imported

import dotenv from 'dotenv';

// Set NODE_ENV first
process.env.NODE_ENV = 'test';

// Load test environment file if it exists
try {
  dotenv.config({ path: '.env.test' });
} catch (error) {
  // Ignore if .env.test doesn't exist
}

// Load default .env as fallback
dotenv.config();

// Set required environment variables if not already set
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:Test%402025%21@localhost:5432/tilanet_test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key';
}

if (!process.env.USE_MOCK_OTP) {
  process.env.USE_MOCK_OTP = 'true';
}

console.log('⚡ Pre-test environment setup completed');
