// The subset of the SQLite driver used by the app. Keeps the driver out of unit tests.
export interface Statement {
  run(...parameters: unknown[]): unknown;
  get(...parameters: unknown[]): unknown;
  all(...parameters: unknown[]): unknown[];
}

export interface Database {
  pragma(source: string, options?: { simple?: boolean }): unknown;
  exec(sql: string): unknown;
  prepare(sql: string): Statement;
  transaction<T>(operation: () => T): () => T;
  close(): unknown;
}
