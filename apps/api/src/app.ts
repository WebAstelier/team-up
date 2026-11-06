import {
  createErrorHandler,
  createNotFoundHandler,
  createRequestLogger,
  type Logger,
} from '@team-up/api/http';
import { Hono } from 'hono';

export interface AppDependencies {
  logger: Logger;
  now: () => number;
}

export const createApp = ({ logger, now }: AppDependencies) => {
  const app = new Hono();
  app.onError(createErrorHandler(logger));
  app.notFound(createNotFoundHandler());
  app.use('*', createRequestLogger(logger, now));
  return app.get('/api/health', (c) => c.json({ status: 'ok' }));
};
