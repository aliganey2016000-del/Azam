import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2).max(160),
  phone: z.string().max(40).optional(),
  nationality: z.string().max(100).optional(),
  universityId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
  programmeId: z.string().uuid().nullable().optional(),
  countryId: z.string().uuid().nullable().optional(),
});

export const applicationCreateSchema = z
  .object({
    source: z.enum(['UNIVERSITY', 'ORGANIZATION', 'INDEPENDENT']),
    universityId: z.string().uuid().nullable().optional(),
    organizationId: z.string().uuid().nullable().optional(),
    programmeId: z.string().uuid().nullable().optional(),
    specialtyId: z.string().uuid().nullable().optional(),
    preferredCountryId: z.string().uuid().nullable().optional(),
    preferredCityId: z.string().uuid().nullable().optional(),
    preferredStartDate: z.coerce.date().nullable().optional(),
    preferredEndDate: z.coerce.date().nullable().optional(),
    clinicalInterests: z.string().max(4000).optional(),
    preferredInstitutionId: z.string().uuid().nullable().optional(),
    noPreferredInstitution: z.boolean().default(false),
  })
  .superRefine((input, ctx) => {
    if (input.preferredStartDate && input.preferredEndDate && input.preferredEndDate <= input.preferredStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['preferredEndDate'],
        message: 'Preferred end date must be after the preferred start date',
      });
    }

    if (input.source === 'INDEPENDENT' && (input.universityId || input.organizationId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['source'],
        message: 'Independent applicants cannot have a university or organization affiliation',
      });
    }

    if (input.source === 'UNIVERSITY' && !input.universityId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['universityId'],
        message: 'University affiliation is required for university applicants',
      });
    }

    if (input.source === 'ORGANIZATION' && !input.organizationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['organizationId'],
        message: 'Organization affiliation is required for organization applicants',
      });
    }
  });

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
