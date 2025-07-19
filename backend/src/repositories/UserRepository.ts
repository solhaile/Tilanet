import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { User, NewUser } from '../db/schema';

export class UserRepository {
  async findByPhone(phoneNumber: string): Promise<User | null> {
    const result = await db.select()
      .from(schema.users)
      .where(eq(schema.users.phoneNumber, phoneNumber))
      .limit(1);
    
    return result[0] || null;
  }

  async create(userData: NewUser): Promise<User> {
    const result = await db.insert(schema.users)
      .values(userData)
      .returning();
    
    return result[0];
  }

  async update(id: string, updateData: Partial<NewUser>): Promise<User> {
    const result = await db.update(schema.users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    return result[0];
  }

  async updateVerification(id: string, isVerified: boolean): Promise<User | null> {
    const result = await db.update(schema.users)
      .set({ isVerified })
      .where(eq(schema.users.id, id))
      .returning();
    
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    
    return result[0] || null;
  }
}
