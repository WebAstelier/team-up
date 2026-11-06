import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('reads the port', () => {
    expect(loadConfig({ PORT: '8080' })).toEqual({ port: 8080 });
  });

  it.each([undefined, ''])('falls back to the default port for %j', (PORT) => {
    expect(loadConfig({ PORT })).toEqual({ port: 3000 });
  });

  it.each(['abc', '0', '-1', '65536', '3000.5'])('rejects the invalid port %s', (PORT) => {
    expect(() => loadConfig({ PORT })).toThrow('PORT must be an integer between 1 and 65535.');
  });
});
