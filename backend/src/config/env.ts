import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  UPLOAD_DIR: z.string().default('./private-uploads'),
  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024),

  // Object storage (S3-compatible). Optional: when unset, storage falls back to local disk.
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Email (SMTP). Optional: when unset, the email service no-ops and logs instead of sending.
  EMAIL_PROVIDER: z.enum(['none', 'smtp']).default('none'),
  EMAIL_FROM: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Configuration error: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
}

const data = result.data;

// Object storage is only usable end-to-end when all S3 coordinates are present. If STORAGE_PROVIDER
// was explicitly set to 's3' but the credentials are incomplete, fail fast instead of silently
// falling back to local disk (which would be surprising in a container with an ephemeral filesystem).
if (data.STORAGE_PROVIDER === 's3') {
  const missing = (['S3_ENDPOINT', 'S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY'] as const).filter(
    (key) => !data[key],
  );
  if (missing.length > 0) {
    throw new Error(`Configuration error: STORAGE_PROVIDER=s3 requires ${missing.join(', ')} to be set`);
  }
}

if (data.EMAIL_PROVIDER === 'smtp') {
  const missing = (['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'] as const).filter((key) => !data[key]);
  if (missing.length > 0) {
    throw new Error(`Configuration error: EMAIL_PROVIDER=smtp requires ${missing.join(', ')} to be set`);
  }
}

export const env = data;
