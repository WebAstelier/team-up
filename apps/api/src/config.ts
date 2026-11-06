export interface Config {
  port: number;
  databasePath: string;
}

const DEFAULT_PORT = 3000;
const MAX_PORT = 65535;

const parsePort = (value: string | undefined): number => {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new Error(`PORT must be an integer between 1 and ${MAX_PORT}.`);
  }
  return port;
};

const requireValue = (name: string, value: string | undefined): string => {
  if (value === undefined || value === '') {
    throw new Error(`${name} is required.`);
  }
  return value;
};

export const loadConfig = (env: Readonly<Record<string, string | undefined>>): Config => ({
  port: parsePort(env['PORT']),
  databasePath: requireValue('DATABASE_PATH', env['DATABASE_PATH']),
});
