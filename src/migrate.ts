import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'

export async function migrateDrizzle<
  TSession = any
>(db: DrizzleDatabase<TSession>, migrations: Iterable<Migration> | AsyncIterable<Migration>) {
  for await (const { filename, idx, ...migrationsMeta } of migrations) {
    await db.dialect.migrate([migrationsMeta], db.session, {})
  }
}

export interface DrizzleDatabaseDialect<TSession = any> {
  migrate(
    migrations: Iterable<MigrationMeta>,
    session: TSession,
    config: Partial<MigrationConfig> | string
  ): any
}

export interface DrizzleDatabase<TSession = any> {
  dialect: DrizzleDatabaseDialect<TSession>
  session: TSession
}

export interface Migration extends MigrationMeta {
  idx: number;
  filename: string;
}
