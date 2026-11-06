import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Shared unit test configuration. Each project runs it with its own root.
export default defineConfig({
  // Keep the cache at the root: with --root, Vite would create node_modules in each project.
  cacheDir: resolve(import.meta.dirname, 'node_modules/.vite'),
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      // Same path as the project, at the workspace root: coverage/apps/api, coverage/libs/api/http.
      reportsDirectory: resolve(
        import.meta.dirname,
        'coverage',
        process.env['VITEST_PROJECT_ROOT'] ?? 'unknown',
      ),
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/index.ts', 'src/testing/**', 'src/main.ts'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
