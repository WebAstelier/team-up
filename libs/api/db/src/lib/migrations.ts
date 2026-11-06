import { createHash } from 'node:crypto';
import { join } from 'node:path';
import type { Logger } from '@team-up/api/http';
import type { Database } from './database';

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export interface MigrationFiles {
  list(directory: string): string[];
  read(path: string): string;
}

interface AppliedMigration {
  version: number;
  checksum: string;
}

const FILE_NAME = /^(\d{4})_([a-z0-9_]+)\.sql$/;

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`;

const checksumOf = (sql: string): string => createHash('sha256').update(sql).digest('hex');

export const loadMigrations = (directory: string, files: MigrationFiles): Migration[] => {
  const migrations = files
    .list(directory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .map((fileName) => {
      const match = FILE_NAME.exec(fileName);
      if (!match) {
        throw new Error(`Invalid migration file name: ${fileName}`);
      }
      return {
        version: Number(match[1]),
        name: String(match[2]),
        sql: files.read(join(directory, fileName)),
      };
    })
    .toSorted((a, b) => a.version - b.version);

  migrations.forEach((migration, index) => {
    if (migrations[index - 1]?.version === migration.version) {
      throw new Error(`Duplicate migration version: ${migration.version}`);
    }
  });
  return migrations;
};

const assertHistoryIsIntact = (migrations: Migration[], applied: AppliedMigration[]): void => {
  for (const { version, checksum } of applied) {
    const migration = migrations.find((candidate) => candidate.version === version);
    if (!migration) {
      throw new Error(`The database has migration ${version}, which this version does not know.`);
    }
    if (checksumOf(migration.sql) !== checksum) {
      throw new Error(`Migration ${version} was changed after being applied.`);
    }
  }
};

export const runMigrations = (
  database: Database,
  migrations: Migration[],
  logger: Logger,
  now: () => number,
): void => {
  database.exec(CREATE_TABLE);
  const applied = database
    .prepare('SELECT version, checksum FROM schema_migrations')
    .all() as AppliedMigration[];
  assertHistoryIsIntact(migrations, applied);

  const latest = Math.max(0, ...applied.map(({ version }) => version));
  const appliedVersions = new Set(applied.map(({ version }) => version));
  const pending = migrations.filter(({ version }) => !appliedVersions.has(version));
  const insert = database.prepare(
    'INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)',
  );

  for (const { version, name, sql } of pending) {
    if (version < latest) {
      throw new Error(`Migration ${version} is older than the latest applied migration.`);
    }
    database.transaction(() => {
      database.exec(sql);
      insert.run(version, name, checksumOf(sql), new Date(now()).toISOString());
    })();
    logger.info('migration.applied', { version, name });
  }
  logger.info('migrations.completed', { applied: pending.length, total: migrations.length });
};
