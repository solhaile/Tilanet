import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import logger from '../src/utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting AUTH-01 database migrations...');

    // Add preferred_language column to users table
    logger.info('Adding preferred_language column to users table...');
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en'
    `);

    // Create sessions table
    logger.info('Creating sessions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        refresh_token text NOT NULL UNIQUE,
        device_info text,
        ip_address text,
        is_active boolean NOT NULL DEFAULT true,
        expires_at timestamp NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `);

    // Add foreign key constraint
    logger.info('Adding foreign key constraint...');
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    // Create indexes
    logger.info('Creating indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language)`);

    // Update existing users to have default language
    logger.info('Updating existing users with default language...');
    await db.execute(sql`
      UPDATE users 
      SET preferred_language = 'en' 
      WHERE preferred_language IS NULL
    `);

    logger.info('AUTH-01 database migrations completed successfully!');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
} 