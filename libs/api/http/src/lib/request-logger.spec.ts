import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { createLoggerDouble } from '../testing';
import { createRequestLogger } from './request-logger';

const setup = () => {
  const { logger, entries } = createLoggerDouble();
  const now = vi.fn<() => number>().mockReturnValueOnce(1000).mockReturnValueOnce(1042);
  const app = new Hono();
  app.use('*', createRequestLogger(logger, now));
  app.get('/parties/:code', (c) => c.json({ ok: true }));
  return { app, entries };
};

describe('createRequestLogger', () => {
  it('logs the method, route pattern, status and duration', async () => {
    const { app, entries } = setup();

    await app.request('/parties/ABC123');

    expect(entries).toEqual([
      {
        level: 'info',
        event: 'request.completed',
        fields: { method: 'GET', route: '/parties/:code', status: 200, durationMs: 42 },
      },
    ]);
  });

  it('never logs the real path or the query string', async () => {
    const { app, entries } = setup();

    await app.request('/parties/ABC123?name=Jane');

    const logged = JSON.stringify(entries);
    expect(logged).not.toContain('ABC123');
    expect(logged).not.toContain('Jane');
  });

  it('does not log the path of an unknown route', async () => {
    const { app, entries } = setup();

    await app.request('/secret-path');

    expect(entries[0]?.fields['status']).toBe(404);
    expect(JSON.stringify(entries)).not.toContain('secret-path');
  });
});
