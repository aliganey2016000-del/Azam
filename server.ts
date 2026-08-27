import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutesRaw from './backend/src/routes/authRoutes';
import studentRoutesRaw from './backend/src/routes/studentRoutes';
import applicationRoutesRaw from './backend/src/routes/applicationRoutes';
import dashboardRoutesRaw from './backend/src/routes/dashboardRoutes';
import documentRoutesRaw from './backend/src/routes/documentRoutes';
import { errorHandler as errorHandlerRaw } from './backend/src/middleware/errorHandler';
import { prisma as prismaRaw } from './backend/src/utils/prisma';

const unwrap = <T>(mod: T): any => {
  let m: any = mod;
  while (m && typeof m === 'object' && 'default' in m && typeof m.default !== 'undefined') {
    m = m.default;
  }
  return m;
};

const authRoutes = unwrap(authRoutesRaw);
const studentRoutes = unwrap(studentRoutesRaw);
const applicationRoutes = unwrap(applicationRoutesRaw);
const dashboardRoutes = unwrap(dashboardRoutesRaw);
const documentRoutes = unwrap(documentRoutesRaw);
const errorHandler = unwrap(errorHandlerRaw);
const prisma = unwrap(prismaRaw);

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }));

  // Health check endpoint (for container / dev server supervisor)
  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' }, message: 'AZAAM Platform is running' });
  });

  app.get('/ready', async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ success: true, data: { status: 'ready', database: 'connected' }, message: 'AZAAM Platform is ready' });
    } catch (error) {
      next(error);
    }
  });

  // API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/applications', applicationRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/documents', documentRoutes);

  // Frontend integration: Vite middleware in development, static files in production
  const frontendDir = path.resolve(process.cwd(), 'frontend');
  const distPath = path.resolve(frontendDir, 'dist');

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      configFile: path.resolve(frontendDir, 'vite.config.ts'),
      root: frontendDir,
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Error handling middleware
  app.use(errorHandler);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AZAAM Platform listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    try {
      if (prisma?.$disconnect) {
        await prisma.$disconnect();
      }
    } catch {
      // ignore
    }
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
