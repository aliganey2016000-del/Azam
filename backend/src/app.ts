import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import { prisma } from './utils/prisma';
import { errorHandler } from './middleware/errorHandler';
import studentRoutes from './routes/studentRoutes';
import applicationRoutes from './routes/applicationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import documentRoutes from './routes/documentRoutes';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'Application is running' }));
app.get('/ready', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ready', database: 'connected' }, message: 'Application is ready' });
  } catch (error) {
    next(error);
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/documents', documentRoutes);

// Frontend Vite Integration (dev) or Static Serving (prod)
const frontendDir = path.resolve(process.cwd(), 'frontend');
const frontendDistDir = path.join(frontendDir, 'dist');

export async function setupFrontend(expressApp: express.Express) {
  if (process.env.NODE_ENV !== 'production' && !fs.existsSync(path.join(frontendDistDir, 'index.html'))) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: frontendDir,
        server: { middlewareMode: true, host: '0.0.0.0' },
        appType: 'spa',
      });
      expressApp.use(vite.middlewares);
      // Fallback error handler after Vite
      expressApp.use(errorHandler);
      return;
    } catch (e) {
      console.warn('Could not initialize Vite dev middleware, falling back to static/dist:', e);
    }
  }

  if (fs.existsSync(frontendDistDir)) {
    expressApp.use(express.static(frontendDistDir));
    expressApp.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDistDir, 'index.html'));
    });
  } else {
    expressApp.use(express.static(frontendDir));
    expressApp.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDir, 'index.html'));
    });
  }

  expressApp.use(errorHandler);
}

export default app;
