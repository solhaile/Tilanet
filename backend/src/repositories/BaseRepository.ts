import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgTable } from 'drizzle-orm/pg-core';

export class BaseRepository<T> {
  protected db: NodePgDatabase;
  protected table: PgTable;

  constructor(db: NodePgDatabase, table: PgTable) {
    this.db = db;
    this.table = table;
  }

  async findAll(): Promise<T[]> {
    return await this.db.select().from(this.table) as T[];
  }

  // Additional base methods can be added here as needed
}
