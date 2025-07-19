#!/usr/bin/env ts-node

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../src/db/schema';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function checkDatabase() {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🔍 Checking database for environment: ${environment}`);
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('📊 Database URL configured:', databaseUrl.replace(/:[^:@]*@/, ':***@'));

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    // Check if tables exist
    console.log('🔍 Checking if tables exist...');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'otp_codes', 'sessions')
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(row => row.table_name));
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found. Running migrations...');
      
      // Run migrations using drizzle-kit push
      console.log('🔄 Running schema push...');
      execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      
      console.log('✅ Schema push completed');
    } else if (tablesResult.rows.length < 3) {
      console.log('⚠️  Some tables missing. Running migrations...');
      
      // Run migrations using drizzle-kit push
      console.log('🔄 Running schema push...');
      execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      
      console.log('✅ Schema push completed');
    } else {
      console.log('✅ All tables exist');
      
      // Check table structure
      console.log('🔍 Checking table structure...');
      
      const usersColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Users table columns:');
      usersColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Test a simple query
    console.log('🧪 Testing database connection...');
    const testResult = await db.select().from(schema.users).limit(1);
    console.log('✅ Database connection and schema working correctly');
    
  } catch (error: any) {
    console.error('❌ Database check failed:', error);
    
    if (error.message && error.message.includes('relation "users" does not exist')) {
      console.log('🔄 Tables missing. Attempting to create them...');
      
      try {
        execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Tables created successfully');
      } catch (migrationError) {
        console.error('❌ Failed to create tables:', migrationError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log('🎉 Database check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database check failed:', error);
      process.exit(1);
    });
} 