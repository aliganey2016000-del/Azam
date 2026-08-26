import { z } from 'zod';
export const documentTypeSchema = z.enum(['PASSPORT', 'STUDENT_ID', 'UNIVERSITY_LETTER', 'TRANSCRIPT', 'CV', 'OTHER']);
export const documentMetadataSchema = z.object({ documentType: documentTypeSchema, applicationId: z.string().uuid().optional() });