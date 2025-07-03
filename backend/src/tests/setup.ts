// Jest setup file - runs before all tests
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Different port for testing to avoid conflicts

// Suppress console.log during tests unless explicitly needed
if (process.env.VERBOSE_TESTS !== 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
}
