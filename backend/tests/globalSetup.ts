import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

// This project has no Docker available in every environment it needs to be tested in, and the
// backend's own test setup previously hardcoded a `localhost` DATABASE_URL that -- combined with
// a since-removed in-memory Prisma shim in src/utils/prisma.ts -- meant "npm test" never actually
// touched a real database at all (see the removal note in src/utils/prisma.ts). To give this
// suite genuine Postgres-backed coverage without requiring Docker, this global setup starts a
// disposable, real PostgreSQL 16 server (via the `embedded-postgres` package, which bundles real
// postgres binaries) for the duration of the test run, applies the actual Prisma migrations
// against it, and seeds it exactly like a real deployment would (prisma/seed.ts). Every test then
// runs against a real database with real constraints, real transactions, and the real schema.

const backendDir = path.resolve(__dirname, '..');
const dataDir = path.resolve(backendDir, '.pgdata-test');
const urlFile = path.resolve(__dirname, '.test-db-url.json');

const PORT = 55199;
const DB_NAME = 'azam_test';
const USER = 'azam_test';
const PASSWORD = 'azam_test_password';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Windows can hold file handles on the postgres data directory open for a short moment after the
 * server process exits, which makes an immediate rmSync fail with EBUSY. Retry a few times with a
 * short delay rather than letting a cleanup race fail the whole test run.
 */
async function rmDirWithRetry(dir: string, attempts = 5) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (i === attempts - 1) {
        console.warn(`[tests/globalSetup] could not remove ${dir} after ${attempts} attempts:`, error);
        return;
      }
      await sleep(500);
    }
  }
}

export default async function setup() {
  await rmDirWithRetry(dataDir);

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: false,
  });

  await pg.initialise();
  await pg.start();
  await pg.createDatabase(DB_NAME);

  const databaseUrl = `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`;
  fs.writeFileSync(urlFile, JSON.stringify({ databaseUrl }));

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    SEED_ADMIN_EMAIL: 'admin.demo@azam.test',
    SEED_ADMIN_PASSWORD: 'DemoPassword!2026',
  };

  execSync('npx prisma migrate deploy --schema prisma/schema.prisma', { cwd: backendDir, env, stdio: 'inherit' });
  execSync('npx tsx prisma/seed.ts', { cwd: backendDir, env, stdio: 'inherit' });

  return async () => {
    await pg.stop();
    await sleep(500);
    fs.rmSync(urlFile, { force: true });
    await rmDirWithRetry(dataDir);
  };
}
