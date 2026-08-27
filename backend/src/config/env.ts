import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().default('postgresql://mock:mock@localhost:5432/mock'),
  JWT_SECRET: z.string().min(32).default('a_very_long_secure_jwt_secret_key_for_development_32chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('a_very_long_secure_jwt_refresh_secret_key_for_dev_32chars'),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_DIR: z.string().default('./private-uploads'),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Configuration error: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
}

export const env = result.data;
