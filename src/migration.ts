import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'

export async function migrate<
  TSession = any
>(db: DrizzleDatabase<TSession>, migrations: Iterable<Migration> | AsyncIterable<Migration>) {
  for await (const { filename, idx, ...migrationsMeta } of migrations) {
    try {
      await db.dialect.migrate([migrationsMeta], db.session, {})
    } catch (cause) {
      throw new MigrationError({ idx, filename }, cause)
    }
  }
}

export interface MigrationErrorOptions {
  idx: number
  filename: string
}

export class MigrationError extends Error {
  constructor(
    readonly data: MigrationErrorOptions,
    cause: unknown
  ) {
    super(`Migration failed: ${data.filename}#${data.idx}`, { cause })
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
