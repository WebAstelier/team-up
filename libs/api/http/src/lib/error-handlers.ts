import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HttpError } from './http-error';
import type { Logger } from './logger';

// Error messages can contain personal data, so only the name and stack frames are logged.
const stackFrames = (error: Error): string =>
  (error.stack ?? '')
    .split('\n')
    .filter((line) => line.trimStart().startsWith('at '))
    .map((line) => line.trim())
    .join(' | ');

export const createErrorHandler =
  (logger: Logger): ErrorHandler =>
  (error, c) => {
    if (error instanceof HttpError) {
      return c.json({ error: { code: error.code, message: error.message } }, error.status);
    }
    if (error instanceof HTTPException) {
      return c.json(
        { error: { code: 'http_error', message: 'The request could not be processed.' } },
        error.status,
      );
    }
    logger.error('request.failed', { errorName: error.name, stack: stackFrames(error) });
    return c.json(
      { error: { code: 'internal_error', message: 'An unexpected error occurred.' } },
      500,
    );
  };

export const createNotFoundHandler = (): NotFoundHandler => (c) =>
  c.json({ error: { code: 'not_found', message: 'Resource not found.' } }, 404);
