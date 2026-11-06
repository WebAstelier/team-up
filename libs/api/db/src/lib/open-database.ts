import type { Database } from './database';

// Required on every connection. SQLite ignores some pragmas silently, so each one is read back.
const REQUIRED_PRAGMAS = ['foreign_keys', 'secure_delete'];

export const openDatabase = (path: string, create: (path: string) => Database): Database => {
  const database = create(path);
  try {
    for (const pragma of REQUIRED_PRAGMAS) {
      database.pragma(`${pragma} = ON`);
      if (database.pragma(pragma, { simple: true }) !== 1) {
        throw new Error(`Could not enable the ${pragma} pragma.`);
      }
    }
  } catch (error) {
    database.close();
    throw error;
  }
  return database;
};
