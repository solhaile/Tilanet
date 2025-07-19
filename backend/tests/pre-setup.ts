// Pre-test setup that runs before Jest starts
// This ensures environment variables are set before any modules are imported

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Setup test database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required for tests');
}

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

// Clean up function to close the pool
export const cleanup = async () => {
  await pool.end();
};
