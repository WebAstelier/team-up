import type { Logger } from '@team-up/api/http';

interface Closable {
  close(callback: () => void): unknown;
}

export interface ServerDependencies<Server extends Closable> {
  start: (port: number, onListening: (port: number) => void) => Server;
  port: number;
  logger: Logger;
  onSignal: (signal: 'SIGTERM' | 'SIGINT', handler: () => void) => void;
  exit: (code: number) => void;
}

export const startServer = <Server extends Closable>({
  start,
  port,
  logger,
  onSignal,
  exit,
}: ServerDependencies<Server>): Server => {
  const server = start(port, (listeningPort) => {
    logger.info('server.started', { port: listeningPort });
  });
  const stop = (): void => {
    logger.info('server.stopping');
    server.close(() => exit(0));
  };
  onSignal('SIGTERM', stop);
  onSignal('SIGINT', stop);
  return server;
};
