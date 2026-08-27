import fs from 'node:fs';
import path from 'node:path';

process.env.NODE_ENV = 'test';

// Populated by tests/globalSetup.ts, which spins up a real (embedded, disposable) Postgres
// server for the whole test run and writes its connection string here. Falls back to a plain
// localhost URL only if globalSetup didn't run for some reason (e.g. running a single test file
// directly without the global setup wired in) -- most DB-touching tests will then fail loudly
// with a connection error rather than silently passing against nothing, which is the correct
// failure mode now that there is no in-memory fallback.
const urlFile = path.resolve(__dirname, '.test-db-url.json');
if (fs.existsSync(urlFile)) {
  const { databaseUrl } = JSON.parse(fs.readFileSync(urlFile, 'utf-8'));
  process.env.DATABASE_URL = databaseUrl;
} else {
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
}

process.env.JWT_SECRET ??= 'test-secret-that-is-long-enough-for-validation';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-that-is-long-enough';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.UPLOAD_DIR ??= path.resolve(__dirname, '..', '.test-uploads');
