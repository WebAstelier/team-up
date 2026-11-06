import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { loadMigrations, openDatabase, runMigrations } from '@team-up/api/db';
import { createLogger } from '@team-up/api/http';
import SqliteDatabase from 'better-sqlite3';
import { createApp } from './app';
import { loadConfig } from './config';
import { startServer } from './server';

const logger = createLogger({
  write: (line) => process.stdout.write(line),
  now: Date.now,
});
const config = loadConfig(process.env);

mkdirSync(dirname(config.databasePath), { recursive: true });
const database = openDatabase(config.databasePath, (path) => new SqliteDatabase(path));

// Migrations run before the server accepts requests. A failure stops the startup.
const migrations = loadMigrations(join(__dirname, 'migrations'), {
  list: (directory) => readdirSync(directory),
  read: (path) => readFileSync(path, 'utf8'),
});
runMigrations(database, migrations, logger, Date.now);

// The compiled front end, next to the API in dist. serveStatic expects a path relative to the cwd.
const webRoot = relative(process.cwd(), join(__dirname, '..', 'web', 'browser'));
const app = createApp({
  logger,
  now: Date.now,
  serveAsset: serveStatic({ root: webRoot }),
  serveIndex: serveStatic({ root: webRoot, path: 'index.html' }),
});

startServer({
  start: (port, onListening) => serve({ fetch: app.fetch, port }, (info) => onListening(info.port)),
  port: config.port,
  logger,
  onSignal: (signal, handler) => process.once(signal, handler),
  exit: (code) => {
    database.close();
    process.exit(code);
  },
});
