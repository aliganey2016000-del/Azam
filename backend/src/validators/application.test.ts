import { describe, expect, it } from 'vitest';
import { applicationCreateSchema } from './application';

const id = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';

describe('applicationCreateSchema', () => {
  it('accepts an independent applicant without affiliation', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      noPreferredInstitution: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects independent applicants with an affiliation', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      organizationId: id,
    });

    expect(result.success).toBe(false);
  });

  it('requires university affiliation for university applicants', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'UNIVERSITY',
    });

    expect(result.success).toBe(false);
  });

  it('requires organization affiliation for organization applicants', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'ORGANIZATION',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid date range', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      preferredStartDate: '2026-10-20',
      preferredEndDate: '2026-10-10',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a preferred institution when noPreferredInstitution is true', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      preferredInstitutionId: otherId,
      noPreferredInstitution: true,
    });

    expect(result.success).toBe(false);
  });
});
