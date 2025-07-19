import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment variables
// In test mode, prefer TEST_DATABASE_URL, fallback to DATABASE_URL
const databaseUrl = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(`DATABASE_URL environment variable is required. NODE_ENV: ${process.env.NODE_ENV}`);
}

// Create connection pool with appropriate settings for test vs production
const pool = new Pool({
  connectionString: databaseUrl,
  // Connection pool settings for CI/testing
  max: process.env.NODE_ENV === 'test' ? 5 : 20,
  idleTimeoutMillis: process.env.NODE_ENV === 'test' ? 1000 : 30000,
  connectionTimeoutMillis: process.env.NODE_ENV === 'test' ? 5000 : 10000,
});

export const db = drizzle(pool, { schema });
export { schema };
