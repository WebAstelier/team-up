export interface Config {
  port: number;
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

export const loadConfig = (env: Readonly<Record<string, string | undefined>>): Config => ({
  port: parsePort(env['PORT']),
});
