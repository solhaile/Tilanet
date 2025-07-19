import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_DATABASE_URL || process.env.DATABASE_URL?.replace('/tilanet_dev', '/tilanet_test')
  : process.env.DATABASE_URL;

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: databaseUrl!,
  },
} satisfies Config;
