import { describe, expect, it } from 'vitest';
import { applicationCreateSchema } from '../src/validators/application';

describe('applicationCreateSchema', () => {
  const universityId = '00000000-0000-0000-0000-000000000001';
  const organizationId = '00000000-0000-0000-0000-000000000002';

  it('requires university affiliation for university applicants', () => {
    const result = applicationCreateSchema.safeParse({ source: 'UNIVERSITY' });
    expect(result.success).toBe(false);
  });

  it('requires organization affiliation for organization applicants', () => {
    const result = applicationCreateSchema.safeParse({ source: 'ORGANIZATION' });
    expect(result.success).toBe(false);
  });

  it('rejects affiliations for independent applicants', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      universityId,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid university application', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'UNIVERSITY',
      universityId,
      preferredStartDate: '2026-09-01',
      preferredEndDate: '2026-09-30',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid organization application', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'ORGANIZATION',
      organizationId,
      preferredStartDate: '2026-09-01',
      preferredEndDate: '2026-09-30',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an end date on or before the start date', () => {
    const result = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      preferredStartDate: '2026-09-30',
      preferredEndDate: '2026-09-01',
    });
    expect(result.success).toBe(false);
  });
});
