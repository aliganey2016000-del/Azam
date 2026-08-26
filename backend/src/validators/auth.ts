import { z } from 'zod';
export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(12), accountType: z.enum(['STUDENT','UNIVERSITY','ORGANIZATION']) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
