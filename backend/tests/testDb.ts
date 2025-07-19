import { db } from '../src/db';
import { sql } from 'drizzle-orm';

export async function setupTestDatabase() {
  try {
    // Create the schema if it doesn't exist (this is idempotent)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "otp_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "code" text NOT NULL,
        "type" text NOT NULL,
        "phone_number" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "is_used" boolean DEFAULT false NOT NULL,
        "attempts" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "phone_number" text NOT NULL,
        "country_code" text DEFAULT '+1' NOT NULL,
        "password" text NOT NULL,
        "first_name" text NOT NULL,
        "last_name" text NOT NULL,
        "is_verified" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
      );
    `);

    // Add foreign key constraint if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
       ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Test database schema setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  try {
    // Clean all test data
    await db.execute(sql`TRUNCATE TABLE otp_codes CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    console.log('Test database cleaned up');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    // Don't throw on cleanup errors
  }
}
