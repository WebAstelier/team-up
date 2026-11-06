import type { MiddlewareHandler } from 'hono';
import { routePath } from 'hono/route';
import type { Logger } from './logger';

// Logs the route pattern, never the real path or query string: they can hold personal data.
export const createRequestLogger =
  (logger: Logger, now: () => number): MiddlewareHandler =>
  async (c, next) => {
    const start = now();
    await next();
    logger.info('request.completed', {
      method: c.req.method,
      route: routePath(c),
      status: c.res.status,
      durationMs: now() - start,
    });
  };
