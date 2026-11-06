import type { LogFields, Logger } from '../lib/logger';

export interface LogEntry {
  level: 'info' | 'error';
  event: string;
  fields: LogFields;
}

export const createLoggerDouble = (): { logger: Logger; entries: LogEntry[] } => {
  const entries: LogEntry[] = [];
  return {
    entries,
    logger: {
      info: (event, fields = {}) => entries.push({ level: 'info', event, fields }),
      error: (event, fields = {}) => entries.push({ level: 'error', event, fields }),
    },
  };
};
