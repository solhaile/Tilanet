#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { db, schema } from '../src/db';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Clean existing data
    await db.delete(schema.otpCodes);
    await db.delete(schema.users);
    
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUsers = [
      {
        phoneNumber: '+1234567890',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        phoneNumber: '+1987654321',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
      },
    ];
    
    const createdUsers = await db.insert(schema.users)
      .values(testUsers)
      .returning();
    
    console.log(`✅ Created ${createdUsers.length} test users`);
    console.log('🎉 Test data seeding completed successfully');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData();
}

export { seedTestData };
