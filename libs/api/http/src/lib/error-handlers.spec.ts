import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import { createLoggerDouble } from '../testing';
import { createErrorHandler, createNotFoundHandler } from './error-handlers';
import { HttpError } from './http-error';

const setup = (error?: Error) => {
  const { logger, entries } = createLoggerDouble();
  const app = new Hono();
  app.onError(createErrorHandler(logger));
  app.notFound(createNotFoundHandler());
  app.get('/throw', () => {
    throw error;
  });
  return { app, entries };
};

describe('createErrorHandler', () => {
  it('returns the status, code and message of an HttpError without logging it', async () => {
    const { app, entries } = setup(new HttpError(409, 'name_taken', 'This name is taken.'));

    const response = await app.request('/throw');

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: 'name_taken', message: 'This name is taken.' },
    });
    expect(entries).toEqual([]);
  });

  it('keeps the status of an HTTPException but hides its message', async () => {
    const { app } = setup(new HTTPException(400, { message: 'Malformed: secret value' }));

    const response = await app.request('/throw');

    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain('secret value');
  });

  it('hides an unexpected error from the client', async () => {
    const { app } = setup(new Error('Failed for Jane Doe'));

    const response = await app.request('/throw');

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: 'internal_error', message: 'An unexpected error occurred.' },
    });
  });

  it('logs an unexpected error without its message', async () => {
    const { app, entries } = setup(new TypeError('Failed for Jane Doe'));

    await app.request('/throw');

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      level: 'error',
      event: 'request.failed',
      fields: { errorName: 'TypeError' },
    });
    expect(JSON.stringify(entries)).not.toContain('Jane Doe');
  });

  it('logs an error without a stack', async () => {
    const error = new Error('no stack');
    delete error.stack;
    const { app, entries } = setup(error);

    await app.request('/throw');

    expect(entries[0]?.fields).toEqual({ errorName: 'Error', stack: '' });
  });
});

describe('createNotFoundHandler', () => {
  it('returns a JSON 404', async () => {
    const { app } = setup();

    const response = await app.request('/unknown');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'not_found', message: 'Resource not found.' },
    });
  });
});
