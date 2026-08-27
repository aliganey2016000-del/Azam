import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance for the process. In development, Node's module cache
// combined with `tsx watch` reloads can create multiple PrismaClient instances (and therefore
// multiple connection pools) across hot reloads; stashing the instance on `globalThis` avoids that.
//
// IMPORTANT: This file previously shipped a hand-rolled in-memory database that silently replaced
// the real Prisma client whenever DATABASE_URL was unset, contained "mock", or contained
// "localhost" (see git history). That meant any typical local/dev DATABASE_URL such as
// postgresql://user:pass@localhost:5432/db -- and therefore this project's own test suite, which
// hardcoded a localhost DATABASE_URL -- silently ran against a fake, partial, non-transactional
// store instead of real Postgres. That is a serious production-safety and test-integrity bug: it
// masked real Prisma/query errors and meant "passing tests" proved nothing about the real schema
// or database behavior. It has been removed. This module now always talks to the real database
// configured by DATABASE_URL, exactly like a normal Prisma-backed service.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
