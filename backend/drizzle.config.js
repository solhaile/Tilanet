const dotenv = require('dotenv');

dotenv.config();

const config = {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};

module.exports = config; 