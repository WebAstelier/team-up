import { serve } from '@hono/node-server';
import { createLogger } from '@team-up/api/http';
import { createApp } from './app';
import { loadConfig } from './config';
import { startServer } from './server';

const logger = createLogger({
  write: (line) => process.stdout.write(line),
  now: Date.now,
});
const app = createApp({ logger, now: Date.now });

startServer({
  start: (port, onListening) => serve({ fetch: app.fetch, port }, (info) => onListening(info.port)),
  port: loadConfig(process.env).port,
  logger,
  onSignal: (signal, handler) => process.once(signal, handler),
  exit: (code) => process.exit(code),
});
