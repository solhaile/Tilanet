#!/usr/bin/env ts-node

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createTestDatabase() {
  console.log('🏗️  Creating test database...');
  
  // Connect to PostgreSQL server (not to a specific database)
  const adminPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Test@2025!', // Default password from your env
    database: 'postgres', // Connect to default postgres database
  });
  
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
    
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createTestDatabase().then(() => {
    console.log('🎉 Database setup completed');
    process.exit(0);
  });
}

export { createTestDatabase };
