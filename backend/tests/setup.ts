import { beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables BEFORE anything else
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
}
dotenv.config(); // Load default .env as fallback

// Setup test environment
beforeAll(async () => {
  // Set test environment variables if not already set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key';
  }
  
  // Set up database URLs for testing
  if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
    // Default test database URL for local development
    process.env.DATABASE_URL = 'postgresql://postgres:Test%402025%21@localhost:5432/tilanet_test';
  }
  
  // Mock Azure Communication Services for tests unless real credentials are provided
  if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING || process.env.USE_MOCK_OTP === 'true') {
    process.env.AZURE_COMMUNICATION_CONNECTION_STRING = 'endpoint=https://test.communication.azure.com/;accesskey=test';
    process.env.AZURE_COMMUNICATION_PHONE_NUMBER = '+1234567890';
  }
  
  console.log('🧪 Test environment configured');
  console.log(`📊 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? '[CONFIGURED]' : '[MISSING]'}`);
  console.log(`📞 USE_MOCK_OTP: ${process.env.USE_MOCK_OTP || 'false'}`);
  console.log(`🗄️  DATABASE_URL: ${process.env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]'}`);
});

afterAll(async () => {
  // Close database connections
  try {
    // The connection pool will be closed automatically when the process exits
    console.log('🧹 Test cleanup completed');
  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
  }
});
