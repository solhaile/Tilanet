#!/usr/bin/env ts-node

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../src/db/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function setupTestDatabase() {
  console.log('🏗️  Setting up test database...');
  
  // Get the base connection URL without database name
  const baseUrl = process.env.DATABASE_URL?.replace('/tilanet_dev', '/postgres') || 
                  'postgresql://postgres:Test@2025!@localhost:5432/postgres';
  const testDbUrl = process.env.TEST_DATABASE_URL || 
                   'postgresql://postgres:Test@2025!@localhost:5432/tilanet_test';

  // Connect to PostgreSQL to create test database if it doesn't exist
  const adminPool = new Pool({ connectionString: baseUrl });
  
  try {
    // Check if test database exists
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'tilanet_test'"
    );
    
    if (result.rows.length === 0) {
      // Create test database
      await adminPool.query('CREATE DATABASE tilanet_test');
      console.log('✅ Test database "tilanet_test" created successfully');
    } else {
      console.log('ℹ️  Test database "tilanet_test" already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating test database:', error);
    
    // If authentication fails, provide helpful message
    if (error.code === '28P01') {
      console.log('💡 Tip: Make sure PostgreSQL is running and password is correct');
      console.log('💡 Default connection: postgres:Test@2025!@localhost:5432');
    }
    
    throw error;
  } finally {
    await adminPool.end();
  }

  // Connect to test database and run migrations
  const testPool = new Pool({ connectionString: testDbUrl });
  const testDb = drizzle(testPool, { schema });

  try {
    // Run migrations on test database
    await migrate(testDb, { migrationsFolder: './drizzle' });
    console.log('✅ Test database migrations completed');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  } finally {
    await testPool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('🎉 Test database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test database setup failed:', error);
      process.exit(1);
    });
}
