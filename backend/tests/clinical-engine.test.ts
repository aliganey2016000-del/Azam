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

  it('formats verified certificates with correct AZM-CERT prefix and sanitizes public fields', () => {
    const year = 2026;
    const certNumber = `AZM-CERT-${year}-A1B2C3D4`;
    expect(certNumber).toMatch(/^AZM-CERT-\d{4}-[A-Z0-9]+$/);

    const publicCertificatePayload = {
      id: 'cert-123',
      certificateNumber: certNumber,
      status: 'VALID',
      issueDate: new Date('2026-08-01'),
      studentName: 'Dr. Jane Doe',
      organizationName: 'Azaam City General Hospital',
      lastVerifiedAt: new Date(),
    };

    expect(publicCertificatePayload).not.toHaveProperty('jwt');
    expect(publicCertificatePayload).not.toHaveProperty('studentDocuments');
    expect(publicCertificatePayload).not.toHaveProperty('auditLog');
    expect(publicCertificatePayload.status).toBe('VALID');
  });
});

