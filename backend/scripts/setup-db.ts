#!/usr/bin/env ts-node

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

export async function setupDatabase() {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🏗️  Setting up database for environment: ${environment}`);
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('📊 Database URL configured:', databaseUrl.replace(/:[^:@]*@/, ':***@'));

  try {
    // Use drizzle-kit push instead of migrate for better compatibility
    console.log('🔄 Pushing schema to database...');
    execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log(`✅ Database schema updated for ${environment}`);
  } catch (error) {
    console.error(`❌ Error updating database for ${environment}:`, error);
    throw error;
  }
}

// For test environment, also create the database if it doesn't exist
export async function setupTestDatabase() {
  console.log('🧪 Setting up test database...');
  
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

  // Now run migrations on the test database
  process.env.DATABASE_URL = testDbUrl;
  await setupDatabase();
}

// Run setup if called directly
if (require.main === module) {
  const isTest = process.env.NODE_ENV === 'test';
  
  if (isTest) {
    setupTestDatabase()
      .then(() => {
        console.log('🎉 Test database setup completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Test database setup failed:', error);
        process.exit(1);
      });
  } else {
    setupDatabase()
      .then(() => {
        console.log('🎉 Database setup completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
      });
  }
}
