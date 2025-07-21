import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function verifyUser(phoneNumber: string) {
  try {
    console.log(`🔍 Verifying user: ${phoneNumber}\n`);
    
    const result = await db.update(users)
      .set({ isVerified: true })
      .where(eq(users.phoneNumber, phoneNumber))
      .returning();

    if (result.length === 0) {
      console.log('❌ User not found.');
      return;
    }

    const user = result[0];
    console.log('✅ User verified successfully!');
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`✅ Verified: ${user.isVerified}`);
    console.log('\n💡 You can now signin with this account!');
    
  } catch (error) {
    console.error('❌ Error verifying user:', error);
  } finally {
    process.exit(0);
  }
}

// Verify the user
verifyUser('+15713208039'); 