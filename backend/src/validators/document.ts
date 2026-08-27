import { z } from 'zod';

// UNIVERSITY_LETTER is kept (not folded into UNIVERSITY_ID) because it is already used by the
// live application wizard (frontend/src/pages/ApplicationWizard.tsx) and by previously uploaded
// production documents; renaming it would silently orphan existing data. UNIVERSITY_ID is added
// as a distinct, additional type instead.
export const documentTypeSchema = z.enum([
  'PASSPORT',
  'NATIONAL_ID',
  'STUDENT_ID',
  'UNIVERSITY_ID',
  'UNIVERSITY_LETTER',
  'MEDICAL_LICENSE',
  'MEDICAL_CERTIFICATE',
  'VACCINATION_RECORD',
  'INSURANCE_DOCUMENT',
  'TRANSCRIPT',
  'CV',
  'OTHER',
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;

export const documentMetadataSchema = z.object({ documentType: documentTypeSchema, applicationId: z.string().uuid().optional() });

export const documentVerifySchema = z.object({
  comment: z.string().max(2000).optional(),
});

export const documentRejectSchema = z.object({
  reason: z.string().min(3, 'A rejection reason is required').max(2000),
});

export const documentSubmitSchema = z.object({
  applicationId: z.string().uuid(),
});
