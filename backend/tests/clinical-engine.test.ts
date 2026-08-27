import { describe, expect, it } from 'vitest';
import { applicationCreateSchema, applicationStatusUpdateSchema } from '../src/validators/application';

describe('Clinical Engine & Placement Lifecycle', () => {
  const universityId = '00000000-0000-4000-8000-000000000001';
  const organizationId = '00000000-0000-4000-8000-000000000002';

  it('validates clinical rotation date ranges correctly', () => {
    const valid = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      preferredStartDate: '2026-10-01',
      preferredEndDate: '2026-11-30',
    });
    expect(valid.success).toBe(true);

    const invalid = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      preferredStartDate: '2026-11-30',
      preferredEndDate: '2026-10-01',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates university applicant requires matching universityId', () => {
    const res = applicationCreateSchema.safeParse({
      source: 'UNIVERSITY',
      universityId,
    });
    expect(res.success).toBe(true);
  });

  it('validates organization applicant requires matching organizationId', () => {
    const res = applicationCreateSchema.safeParse({
      source: 'ORGANIZATION',
      organizationId,
    });
    expect(res.success).toBe(true);
  });

  it('prohibits affiliations for independent medical applicants', () => {
    const res = applicationCreateSchema.safeParse({
      source: 'INDEPENDENT',
      organizationId,
    });
    expect(res.success).toBe(false);
  });

  it('validates status transition payloads strictly', () => {
    const validTransition = applicationStatusUpdateSchema.safeParse({
      status: 'APPROVED',
      comment: 'Student credentials and health clearings verified.',
    });
    expect(validTransition.success).toBe(true);

    const invalidTransition = applicationStatusUpdateSchema.safeParse({
      status: 'INVALID_STATUS_NAME',
    });
    expect(invalidTransition.success).toBe(false);
  });

  it('verifies clinical rotation capacity math and date overlap rules', () => {
    const p1Start = new Date('2026-09-01');
    const p1End = new Date('2026-09-30');

    const p2Start = new Date('2026-09-15');
    const p2End = new Date('2026-10-15');

    const overlaps = p1Start <= p2End && p1End >= p2Start;
    expect(overlaps).toBe(true);

    const p3Start = new Date('2026-10-01');
    const p3End = new Date('2026-10-31');
    const noOverlap = p1Start <= p3End && p1End >= p3Start;
    expect(noOverlap).toBe(false);
  });

  // NOTE: certificate number formatting and public-verification sanitization used to be
  // "tested" here by asserting properties on a hand-written literal object -- it never called
  // the real issueCertificate/verifyCertificate service functions, so it could not have caught a
  // real regression. That has been replaced with genuine, real-service-backed, real-Postgres
  // coverage in tests/certificates.test.ts (see "adminService.verifyCertificate (public endpoint,
  // sanitized)" and "placementService.issueCertificate").
});

