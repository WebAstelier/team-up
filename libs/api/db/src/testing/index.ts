import type { Database, Statement } from '../lib/database';

export interface DatabaseDoubleOptions {
  appliedMigrations?: { version: number; checksum: string }[];
  ignoredPragmas?: string[];
  failingSql?: string;
}

export const createDatabaseDouble = ({
  appliedMigrations = [],
  ignoredPragmas = [],
  failingSql,
}: DatabaseDoubleOptions = {}) => {
  const executed: string[] = [];
  const pragmas: string[] = [];
  const inserted: unknown[][] = [];
  const state = { closed: false, committedTransactions: 0, rolledBackTransactions: 0 };

  const statement = (sql: string): Statement => ({
    run: (...parameters) => {
      if (sql.startsWith('INSERT')) {
        inserted.push(parameters);
      }
    },
    get: () => undefined,
    all: () => (sql.startsWith('SELECT') ? appliedMigrations : []),
  });

  const database: Database = {
    pragma: (source) => {
      if (source.includes('=')) {
        pragmas.push(source);
        return undefined;
      }
      return ignoredPragmas.includes(source) ? 0 : 1;
    },
    exec: (sql) => {
      if (sql === failingSql) {
        throw new Error(`Failure on ${sql}`);
      }
      executed.push(sql);
    },
    prepare: statement,
    transaction: (operation) => () => {
      const insertedBefore = inserted.length;
      try {
        const result = operation();
        state.committedTransactions += 1;
        return result;
      } catch (error) {
        inserted.length = insertedBefore;
        state.rolledBackTransactions += 1;
        throw error;
      }
    },
    close: () => {
      state.closed = true;
    },
  };

  return { database, executed, pragmas, inserted, state };
};
