import { createHash } from 'node:crypto';
import { createLoggerDouble } from '@team-up/api/http/testing';
import { describe, expect, it, vi } from 'vitest';
import { createDatabaseDouble } from '../testing';
import { loadMigrations, runMigrations, type Migration } from './migrations';

const NOW = Date.UTC(2026, 0, 2, 3, 4, 5);
const checksum = (sql: string): string => createHash('sha256').update(sql).digest('hex');

const first: Migration = { version: 1, name: 'first', sql: 'CREATE TABLE first (id INTEGER)' };
const second: Migration = { version: 2, name: 'second', sql: 'CREATE TABLE second (id INTEGER)' };

const setup = (options: Parameters<typeof createDatabaseDouble>[0] = {}) => {
  const double = createDatabaseDouble(options);
  const { logger, entries } = createLoggerDouble();
  return {
    ...double,
    entries,
    run: (migrations: Migration[]) => runMigrations(double.database, migrations, logger, () => NOW),
  };
};

const load = (contents: Record<string, string>) =>
  loadMigrations('dir', {
    list: () => Object.keys(contents),
    read: (path) => contents[path.split('/').at(-1) ?? ''] ?? '',
  });

describe('loadMigrations', () => {
  it('returns the migrations in version order', () => {
    expect(load({ '0002_second.sql': 'B', '0001_first.sql': 'A' })).toEqual([
      { version: 1, name: 'first', sql: 'A' },
      { version: 2, name: 'second', sql: 'B' },
    ]);
  });

  it('reads files from the given directory', () => {
    const read = vi.fn<(path: string) => string>().mockReturnValue('A');

    loadMigrations('some/dir', { list: () => ['0001_first.sql'], read });

    expect(read).toHaveBeenCalledExactlyOnceWith('some/dir/0001_first.sql');
  });

  it('ignores other files', () => {
    expect(load({ '.gitkeep': '', 'README.md': '' })).toEqual([]);
  });

  it.each(['first.sql', '1_first.sql', '0001-first.sql', '0001_First.sql'])(
    'rejects the invalid file name %s',
    (fileName) => {
      expect(() => load({ [fileName]: 'A' })).toThrow(`Invalid migration file name: ${fileName}`);
    },
  );

  it('rejects a duplicate version', () => {
    expect(() => load({ '0001_a.sql': 'A', '0001_b.sql': 'B' })).toThrow(
      'Duplicate migration version: 1',
    );
  });
});

describe('runMigrations', () => {
  it('creates the history table first', () => {
    const { run, executed } = setup();

    run([first]);

    expect(executed[0]).toContain('CREATE TABLE IF NOT EXISTS schema_migrations');
  });

  it('applies pending migrations in order, each in a transaction', () => {
    const { run, executed, state } = setup();

    run([first, second]);

    expect(executed.slice(1)).toEqual([first.sql, second.sql]);
    expect(state.committedTransactions).toBe(2);
  });

  it('records each applied migration', () => {
    const { run, inserted } = setup();

    run([first]);

    expect(inserted).toEqual([[1, 'first', checksum(first.sql), '2026-01-02T03:04:05.000Z']]);
  });

  it('skips migrations that are already applied', () => {
    const { run, executed, inserted } = setup({
      appliedMigrations: [{ version: 1, checksum: checksum(first.sql) }],
    });

    run([first, second]);

    expect(executed.slice(1)).toEqual([second.sql]);
    expect(inserted).toHaveLength(1);
  });

  it('logs versions and names, and the totals', () => {
    const { run, entries } = setup();

    run([first]);

    expect(entries).toEqual([
      { level: 'info', event: 'migration.applied', fields: { version: 1, name: 'first' } },
      { level: 'info', event: 'migrations.completed', fields: { applied: 1, total: 1 } },
    ]);
  });

  it('stops at the first failure and rolls it back', () => {
    const { run, inserted, state } = setup({ failingSql: second.sql });
    const third: Migration = { version: 3, name: 'third', sql: 'CREATE TABLE third (id INTEGER)' };

    expect(() => run([first, second, third])).toThrow('Failure on');

    expect(inserted).toHaveLength(1);
    expect(state.committedTransactions).toBe(1);
    expect(state.rolledBackTransactions).toBe(1);
  });

  it('refuses a database ahead of the code', () => {
    const { run, executed } = setup({ appliedMigrations: [{ version: 9, checksum: 'x' }] });

    expect(() => run([first])).toThrow(
      'The database has migration 9, which this version does not know.',
    );
    expect(executed).toHaveLength(1);
  });

  it('refuses a migration changed after being applied', () => {
    const { run, executed } = setup({
      appliedMigrations: [{ version: 1, checksum: checksum('previous content') }],
    });

    expect(() => run([first])).toThrow('Migration 1 was changed after being applied.');
    expect(executed).toHaveLength(1);
  });

  it('refuses a pending migration older than the latest applied one', () => {
    const { run, executed } = setup({
      appliedMigrations: [{ version: 2, checksum: checksum(second.sql) }],
    });

    expect(() => run([first, second])).toThrow(
      'Migration 1 is older than the latest applied migration.',
    );
    expect(executed).toHaveLength(1);
  });
});
