import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({ NODE_ENV: z.enum(['development','test','production']).default('development'), PORT: z.coerce.number().int().positive().default(4000), DATABASE_URL: z.string().min(1), JWT_SECRET: z.string().min(32), JWT_REFRESH_SECRET: z.string().min(32), CORS_ORIGIN: z.string().url().default('http://localhost:5173'), UPLOAD_DIR: z.string().default('./private-uploads') });
const result = schema.safeParse(process.env);
if (!result.success) throw new Error(`Configuration error: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
export const env = result.data;
