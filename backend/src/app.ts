import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import { env } from './config/env';
import { prisma } from './utils/prisma';
import { errorHandler } from './middleware/errorHandler';
import studentRoutes from './routes/studentRoutes';
import applicationRoutes from './routes/applicationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import documentRoutes from './routes/documentRoutes';
import adminRoutes from './routes/adminRoutes';
import placementRoutes from './routes/placementRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// NOTE on Content-Security-Policy: helmet's default CSP is left disabled here rather than
// re-enabled blind. This API serves JSON only (no HTML views, no inline scripts/styles of its
// own), so a same-origin script/style CSP would provide no meaningful protection for this
// service -- CSP only matters for the responses that render in a browser, which is the
// frontend's Nginx layer, not this API. Re-enabling it here without knowing the frontend's
// asset origins (CDN fonts, inline styles from the build, etc.) risks breaking the frontend for
// no security benefit, since this server does not render any of that markup. All other helmet
// protections (HSTS, X-Content-Type-Options, X-Frame-Options, etc.) remain fully enabled below.
// crossOriginEmbedderPolicy stays disabled because this API is consumed cross-origin by the
// frontend and does not need COEP's cross-origin isolation guarantees.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins }));
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
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/placements', placementRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Error handler for API routes
app.use(errorHandler);

export default app;
