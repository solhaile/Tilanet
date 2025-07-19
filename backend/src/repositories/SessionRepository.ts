import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { Session, NewSession } from '../db/schema';
import logger from '../utils/logger';

export class SessionRepository {
  async create(sessionData: NewSession): Promise<Session> {
    try {
      const [session] = await db.insert(sessions).values(sessionData).returning();
      logger.info('Session created', { sessionId: session.id, userId: session.userId });
      return session;
    } catch (error) {
      logger.error('Error creating session', { error });
      throw error;
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    try {
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.refreshToken, refreshToken))
        .limit(1);
      
      return session || null;
    } catch (error) {
      logger.error('Error finding session by refresh token', { error });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Session[]> {
    try {
      return await db.select()
        .from(sessions)
        .where(eq(sessions.userId, userId));
    } catch (error) {
      logger.error('Error finding sessions by user ID', { error });
      throw error;
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    try {
      await db.update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.id, sessionId));
      
      logger.info('Session deactivated', { sessionId });
    } catch (error) {
      logger.error('Error deactivating session', { error });
      throw error;
    }
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    try {
      await db.update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.userId, userId));
      
      logger.info('All user sessions deactivated', { userId });
    } catch (error) {
      logger.error('Error deactivating all user sessions', { error });
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      await db.delete(sessions)
        .where(lt(sessions.expiresAt, new Date()));
      
      logger.info('Expired sessions cleaned up');
    } catch (error) {
      logger.error('Error cleaning up expired sessions', { error });
      throw error;
    }
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const [session] = await db.select()
        .from(sessions)
        .where(and(
          eq(sessions.id, sessionId),
          eq(sessions.isActive, true)
        ))
        .limit(1);
      
      return !!session && session.expiresAt > new Date();
    } catch (error) {
      logger.error('Error checking session validity', { error });
      return false;
    }
  }
} 