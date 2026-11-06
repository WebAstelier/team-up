import { createLoggerDouble } from '@team-up/api/http/testing';
import { describe, expect, it, vi } from 'vitest';
import { startServer } from './server';

const setup = () => {
  const { logger, entries } = createLoggerDouble();
  const handlers = new Map<string, () => void>();
  const close = vi.fn<(callback: () => void) => void>();
  const exit = vi.fn<(code: number) => void>();
  const start = vi.fn<
    (port: number, onListening: (port: number) => void) => { close: typeof close }
  >((port, onListening) => {
    onListening(port);
    return { close };
  });
  startServer({
    start,
    port: 3000,
    logger,
    exit,
    onSignal: (signal, handler) => handlers.set(signal, handler),
  });
  return { start, close, exit, entries, handlers };
};

describe('startServer', () => {
  it('starts on the given port and logs it', () => {
    const { start, entries } = setup();

    expect(start).toHaveBeenCalledExactlyOnceWith(3000, expect.any(Function));
    expect(entries).toEqual([{ level: 'info', event: 'server.started', fields: { port: 3000 } }]);
  });

  it.each(['SIGTERM', 'SIGINT'])('closes the server, then exits, on %s', (signal) => {
    const { close, exit, handlers } = setup();

    handlers.get(signal)?.();

    expect(close).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();

    close.mock.calls[0]?.[0]();

    expect(exit).toHaveBeenCalledExactlyOnceWith(0);
  });
});
