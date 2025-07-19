#!/usr/bin/env ts-node

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function setupProductionDatabase() {
  const environment = process.env.NODE_ENV || 'production';
  console.log(`🏗️  Setting up production database for environment: ${environment}`);
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('📊 Database URL configured:', databaseUrl.replace(/:[^:@]*@/, ':***@'));

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    // Step 1: Check if we can connect to the database
    console.log('🔍 Step 1: Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Step 2: Check if tables exist
    console.log('🔍 Step 2: Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'otp_codes', 'sessions')
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(row => row.table_name));

    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found. Creating schema...');
      
      // Step 3: Ensure drizzle-kit is available
      console.log('🔍 Step 3: Ensuring drizzle-kit is available...');
      await ensureDrizzleKit();
      
      // Step 4: Build TypeScript if needed
      console.log('🔍 Step 4: Building TypeScript...');
      await buildTypeScript();
      
      // Step 5: Push schema to database
      console.log('🔄 Step 5: Pushing schema to database...');
      try {
        execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Schema push completed');
      } catch (error) {
        console.log('⚠️  TypeScript config failed, trying JavaScript config...');
        try {
          execSync('npx drizzle-kit push:pg --config=drizzle.config.js', { 
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: databaseUrl }
          });
          console.log('✅ Schema push completed with JavaScript config');
        } catch (jsError) {
          console.error('❌ Both configs failed:', jsError);
          throw jsError;
        }
      }
    } else if (tablesResult.rows.length < 3) {
      console.log('⚠️  Some tables missing. Updating schema...');
      
      await ensureDrizzleKit();
      await buildTypeScript();
      
      try {
        execSync('npx drizzle-kit push:pg --config=drizzle.config.ts', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Schema update completed');
      } catch (error) {
        console.log('⚠️  TypeScript config failed, trying JavaScript config...');
        try {
          execSync('npx drizzle-kit push:pg --config=drizzle.config.js', { 
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: databaseUrl }
          });
          console.log('✅ Schema update completed with JavaScript config');
        } catch (jsError) {
          console.error('❌ Both configs failed:', jsError);
          throw jsError;
        }
      }
    } else {
      console.log('✅ All tables exist');
    }

    // Step 6: Verify schema
    console.log('🔍 Step 6: Verifying schema...');
    await verifySchema(pool);
    
    // Step 7: Test database operations
    console.log('🧪 Step 7: Testing database operations...');
    const testResult = await db.select().from(schema.users).limit(1);
    console.log('✅ Database operations working correctly');

  } catch (error: any) {
    console.error('❌ Production database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function ensureDrizzleKit(): Promise<void> {
  try {
    // Check if drizzle-kit is available
    execSync('npx drizzle-kit --version', { stdio: 'pipe' });
    console.log('✅ drizzle-kit is available');
  } catch (error) {
    console.log('⚠️  drizzle-kit not found. Installing...');
    try {
      // Install drizzle-kit globally or locally
      execSync('npm install drizzle-kit', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ drizzle-kit installed');
    } catch (installError) {
      console.error('❌ Failed to install drizzle-kit:', installError);
      throw new Error('drizzle-kit installation failed');
    }
  }
}

async function buildTypeScript(): Promise<void> {
  try {
    // Check if dist directory exists
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('🔨 Building TypeScript...');
      execSync('npm run build', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ TypeScript build completed');
    } else {
      console.log('✅ TypeScript already built');
    }
  } catch (error) {
    console.log('⚠️  TypeScript build failed, continuing with source files...');
  }
}

async function verifySchema(pool: Pool) {
  console.log('🔍 Verifying table structure...');
  
  // Check users table structure
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

  // Check if all required columns exist
  const requiredColumns = ['id', 'phone_number', 'country_code', 'password', 'first_name', 'last_name', 'preferred_language', 'is_verified', 'created_at', 'updated_at'];
  const existingColumns = usersColumns.rows.map(col => col.column_name);
  
  const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
  if (missingColumns.length > 0) {
    console.log('⚠️  Missing columns:', missingColumns);
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  console.log('✅ Schema verification completed');
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('🎉 Production database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production database setup failed:', error);
      process.exit(1);
    });
} 