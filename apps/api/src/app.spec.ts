import { createLoggerDouble } from '@team-up/api/http/testing';
import type { MiddlewareHandler } from 'hono';
import { testClient } from 'hono/testing';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';

const setup = () => {
  const { logger, entries } = createLoggerDouble();
  const serveAsset = vi.fn<MiddlewareHandler>((c, next) =>
    c.req.path === '/main.js' ? Promise.resolve(c.text('asset')) : next(),
  );
  const serveIndex = vi.fn<MiddlewareHandler>((c) => Promise.resolve(c.text('index')));
  return {
    app: createApp({ logger, now: () => 0, serveAsset, serveIndex }),
    entries,
    serveAsset,
    serveIndex,
  };
};

describe('createApp', () => {
  it('reports its health', async () => {
    const { app } = setup();

    const response = await testClient(app).api.health.$get();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('logs each request', async () => {
    const { app, entries } = setup();

    await testClient(app).api.health.$get();

    expect(entries).toEqual([
      {
        level: 'info',
        event: 'request.completed',
        fields: { method: 'GET', route: '/api/health', status: 200, durationMs: 0 },
      },
    ]);
  });

  it.each(['/api/unknown', '/api'])(
    'answers %s with a JSON 404, not the front end',
    async (path) => {
      const { app, serveIndex } = setup();

      const response = await app.request(path);

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ error: { code: 'not_found' } });
      expect(serveIndex).not.toHaveBeenCalled();
    },
  );

  it('does not look for an API path among the assets', async () => {
    const { app, serveAsset } = setup();

    await app.request('/api/unknown');

    expect(serveAsset).not.toHaveBeenCalled();
  });

  it('serves an existing asset', async () => {
    const { app, serveIndex } = setup();

    const response = await app.request('/main.js');

    expect(await response.text()).toBe('asset');
    expect(serveIndex).not.toHaveBeenCalled();
  });

  it.each(['/', '/games/killer'])('answers the page %s with the front end', async (path) => {
    const { app } = setup();

    const response = await app.request(path);

    expect(await response.text()).toBe('index');
  });

  it('answers a missing asset with a 404, not the front end', async () => {
    const { app, serveIndex } = setup();

    const response = await app.request('/missing.js');

    expect(response.status).toBe(404);
    expect(serveIndex).not.toHaveBeenCalled();
  });

  it('only serves the front end on GET', async () => {
    const { app, serveIndex } = setup();

    const response = await app.request('/games', { method: 'POST' });

    expect(response.status).toBe(404);
    expect(serveIndex).not.toHaveBeenCalled();
  });
});
