import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL for all environments
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool, { schema });
export { schema };
