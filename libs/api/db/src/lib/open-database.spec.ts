import { describe, expect, it, vi } from 'vitest';
import { createDatabaseDouble } from '../testing';
import { openDatabase } from './open-database';

describe('openDatabase', () => {
  it('opens the given path', () => {
    const { database } = createDatabaseDouble();
    const create = vi.fn<(path: string) => typeof database>().mockReturnValue(database);

    expect(openDatabase('some/path', create)).toBe(database);
    expect(create).toHaveBeenCalledExactlyOnceWith('some/path');
  });

  it('enables foreign keys and secure delete', () => {
    const { database, pragmas } = createDatabaseDouble();

    openDatabase('path', () => database);

    expect(pragmas).toEqual(['foreign_keys = ON', 'secure_delete = ON']);
  });

  it.each(['foreign_keys', 'secure_delete'])(
    'closes the connection and fails when %s stays off',
    (pragma) => {
      const { database, state } = createDatabaseDouble({ ignoredPragmas: [pragma] });

      expect(() => openDatabase('path', () => database)).toThrow(
        `Could not enable the ${pragma} pragma.`,
      );
      expect(state.closed).toBe(true);
    },
  );
});
