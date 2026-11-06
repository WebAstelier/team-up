import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Options for the Angular unit-test builder. Generated output stays at the workspace root.
export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: resolve(import.meta.dirname, '../../../coverage/libs/web/design-system'),
    },
  },
});
