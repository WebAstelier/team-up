import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

const DATABASE_PATH = 'some/path';

describe('loadConfig', () => {
  it('reads the port and the database path', () => {
    expect(loadConfig({ PORT: '8080', DATABASE_PATH })).toEqual({
      port: 8080,
      databasePath: DATABASE_PATH,
    });
  });

  it.each([undefined, ''])('falls back to the default port for %j', (PORT) => {
    expect(loadConfig({ PORT, DATABASE_PATH }).port).toBe(3000);
  });

  it.each(['abc', '0', '-1', '65536', '3000.5'])('rejects the invalid port %s', (PORT) => {
    expect(() => loadConfig({ PORT, DATABASE_PATH })).toThrow(
      'PORT must be an integer between 1 and 65535.',
    );
  });

  it.each([undefined, ''])('requires the database path, rejecting %j', (value) => {
    expect(() => loadConfig({ DATABASE_PATH: value })).toThrow('DATABASE_PATH is required.');
  });
});
