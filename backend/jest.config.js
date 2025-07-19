module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  setupFiles: ['<rootDir>/tests/pre-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially to avoid DB conflicts
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  forceExit: true, // Force Jest to exit after tests complete (CI-friendly)
  detectOpenHandles: false, // Disable for CI stability
  verbose: process.env.CI ? false : true, // Less verbose in CI
};
