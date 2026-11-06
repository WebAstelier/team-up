import type { ContentfulStatusCode } from 'hono/utils/http-status';

// An expected failure. Its code and message are safe to send to the client.
export class HttpError extends Error {
  public override readonly name = 'HttpError';

  public constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
