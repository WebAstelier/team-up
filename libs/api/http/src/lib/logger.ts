export type LogFields = Readonly<Record<string, string | number | boolean>>;

// Only pass technical values: names, photos and session tokens must never be logged.
export interface Logger {
  info(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

export interface LoggerDependencies {
  write: (line: string) => void;
  now: () => number;
}

export const createLogger = ({ write, now }: LoggerDependencies): Logger => {
  const log = (level: 'info' | 'error', event: string, fields: LogFields = {}): void => {
    const time = new Date(now()).toISOString();
    write(`${JSON.stringify({ ...fields, time, level, event })}\n`);
  };
  return {
    info: (event, fields) => log('info', event, fields),
    error: (event, fields) => log('error', event, fields),
  };
};
