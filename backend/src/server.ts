import { env } from './config/env';
import app from './app';
import { prisma } from './utils/prisma';

async function startServer() {
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`AZAAM API running on http://0.0.0.0:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
