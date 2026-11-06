import {
  createErrorHandler,
  createNotFoundHandler,
  createRequestLogger,
  type Logger,
} from '@team-up/api/http';
import { Hono, type MiddlewareHandler } from 'hono';

export interface AppDependencies {
  logger: Logger;
  now: () => number;
  serveAsset: MiddlewareHandler;
  serveIndex: MiddlewareHandler;
}

// A path with a file extension is a missing asset, not a page of the front end.
const isPagePath = (path: string): boolean =>
  path !== '/api' && !path.startsWith('/api/') && !(path.split('/').at(-1) ?? '').includes('.');

export const createApp = ({ logger, now, serveAsset, serveIndex }: AppDependencies) => {
  const app = new Hono();
  app.onError(createErrorHandler(logger));
  app.notFound(createNotFoundHandler());
  app.use('*', createRequestLogger(logger, now));
  const routes = app.get('/api/health', (c) => c.json({ status: 'ok' }));
  app.get('*', (c, next) => (c.req.path.startsWith('/api/') ? next() : serveAsset(c, next)));
  app.get('*', (c, next) => (isPagePath(c.req.path) ? serveIndex(c, next) : next()));
  return routes;
};
