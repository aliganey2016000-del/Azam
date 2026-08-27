import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: [path.resolve(__dirname, 'tests/globalSetup.ts')],
    setupFiles: [path.resolve(__dirname, 'tests/setup.ts')],
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Real-Postgres-backed tests share one disposable database for the whole run (see
    // globalSetup.ts) and use unique random data per test rather than truncating between tests,
    // so file-level parallelism is safe; keep it off only to make failure output easier to read
    // in CI logs.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});


