import { env } from './config/env';
import app from './app';
import { prisma } from './utils/prisma';
const server = app.listen(env.PORT, () => console.log(`AZAAM API listening on port ${env.PORT}`));
const shutdown = async () => { server.close(); await prisma.$disconnect(); process.exit(0); };
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
