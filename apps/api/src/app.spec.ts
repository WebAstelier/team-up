import { createLoggerDouble } from '@team-up/api/http/testing';
import { testClient } from 'hono/testing';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

const setup = () => {
  const { logger, entries } = createLoggerDouble();
  return { app: createApp({ logger, now: () => 0 }), entries };
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

  it('answers an unknown route with a JSON 404', async () => {
    const { app } = setup();

    const response = await app.request('/api/unknown');

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: 'not_found' } });
  });
});
