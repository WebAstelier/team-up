import { describe, expect, it, vi } from 'vitest';
import { createLogger } from './logger';

const NOW = Date.UTC(2026, 0, 2, 3, 4, 5);

const setup = () => {
  const write = vi.fn<(line: string) => void>();
  return { write, logger: createLogger({ write, now: () => NOW }) };
};

describe('createLogger', () => {
  it('writes an info event as one JSON line', () => {
    const { write, logger } = setup();

    logger.info('server.started', { port: 3000 });

    expect(write).toHaveBeenCalledExactlyOnceWith(
      '{"port":3000,"time":"2026-01-02T03:04:05.000Z","level":"info","event":"server.started"}\n',
    );
  });

  it('writes an error event without fields', () => {
    const { write, logger } = setup();

    logger.error('request.failed');

    expect(write).toHaveBeenCalledExactlyOnceWith(
      '{"time":"2026-01-02T03:04:05.000Z","level":"error","event":"request.failed"}\n',
    );
  });

  it('does not let fields override the reserved keys', () => {
    const { write, logger } = setup();

    logger.info('real.event', { event: 'fake', level: 'fake', time: 'fake' });

    expect(JSON.parse(write.mock.calls[0]?.[0] ?? '')).toEqual({
      time: '2026-01-02T03:04:05.000Z',
      level: 'info',
      event: 'real.event',
    });
  });
});
