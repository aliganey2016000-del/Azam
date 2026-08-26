import { z } from 'zod';
export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(12), accountType: z.enum(['STUDENT','UNIVERSITY','ORGANIZATION','SUPERVISOR']), source: z.enum(['UNIVERSITY','ORGANIZATION','INDEPENDENT']).default('INDEPENDENT'), fullName: z.string().min(2).max(160).optional(), phone: z.string().max(40).optional(), nationality: z.string().max(100).optional() });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
