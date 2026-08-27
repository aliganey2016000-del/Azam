import { describe, it, expect } from 'vitest';
import { prisma } from '../src/utils/prisma';
import { issueCertificate } from '../src/services/placementService';
import { verifyCertificate, revokeCertificate } from '../src/services/adminService';
import { ConflictError, ValidationError } from '../src/utils/errors';
import { createStudent, createUser, createApplicationForStudent, createPlacementWithAttachment } from './helpers';

async function buildCompletedAttachment() {
  const admin = await createUser('AZAAM_STAFF');
  const { user, student } = await createStudent({ fullName: 'Certificate Test Student' });
  const application = await createApplicationForStudent(student.id, { status: 'ACTIVE' });
  const { attachment } = await createPlacementWithAttachment(application.id, student.id);
  await prisma.clinicalAttachment.update({ where: { id: attachment.id }, data: { status: 'COMPLETED' } });
  return { admin, user, student, application, attachment };
}

describe('placementService.issueCertificate', () => {
  it('refuses to issue a certificate before the attachment is COMPLETED', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { student } = await createStudent();
    const application = await createApplicationForStudent(student.id, { status: 'ACTIVE' });
    const { attachment } = await createPlacementWithAttachment(application.id, student.id);
    // attachment left at default IN_PROGRESS status

    await expect(issueCertificate(admin.id, attachment.id)).rejects.toBeInstanceOf(ConflictError);
  });

  it('issues a certificate with a unique AZM-CERT number once COMPLETED', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);
    expect(cert.certificateNumber).toMatch(/^AZM-CERT-\d{4}-[A-F0-9]+$/);
    expect(cert.status).toBe('VALID');
  });

  it('is idempotent: issuing twice for the same attachment returns the same certificate', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const first = await issueCertificate(admin.id, attachment.id);
    const second = await issueCertificate(admin.id, attachment.id);
    expect(second.id).toBe(first.id);
    expect(second.certificateNumber).toBe(first.certificateNumber);

    const count = await prisma.certificate.count({ where: { attachmentId: attachment.id } });
    expect(count).toBe(1);
  });

  it('produces unique certificate numbers across different attachments', async () => {
    const first = await buildCompletedAttachment();
    const second = await buildCompletedAttachment();
    const certA = await issueCertificate(first.admin.id, first.attachment.id);
    const certB = await issueCertificate(second.admin.id, second.attachment.id);
    expect(certA.certificateNumber).not.toBe(certB.certificateNumber);
  });
});

describe('adminService.verifyCertificate (public endpoint, sanitized)', () => {
  it('returns valid=true with sanitized public fields for a VALID certificate, and updates lastVerifiedAt', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);

    const result: any = await verifyCertificate(cert.certificateNumber);
    expect(result.valid).toBe(true);
    expect(result.certificate.certificateNumber).toBe(cert.certificateNumber);
    expect(result.certificate).not.toHaveProperty('jwt');
    expect(result.certificate).not.toHaveProperty('email');
    expect(result.certificate).not.toHaveProperty('phone');
    expect(result.certificate).not.toHaveProperty('passport');
    expect(result.certificate.lastVerifiedAt).toBeTruthy();

    const verification = await prisma.certificateVerification.findUniqueOrThrow({ where: { certificateId: cert.id } });
    expect(verification.verificationCount).toBeGreaterThanOrEqual(1);
    expect(verification.lastVerifiedAt).toBeTruthy();

    const before = verification.verificationCount;
    await verifyCertificate(cert.certificateNumber);
    const again = await prisma.certificateVerification.findUniqueOrThrow({ where: { certificateId: cert.id } });
    expect(again.verificationCount).toBe(before + 1);
  });

  it('returns valid=false with a not-found message for an unknown certificate number', async () => {
    const result: any = await verifyCertificate('AZM-CERT-9999-DOESNOTEXIST');
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('returns valid=false with revocation details for a REVOKED certificate', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);
    await revokeCertificate(admin.id, cert.id, 'Attendance requirements not met');

    const result: any = await verifyCertificate(cert.certificateNumber);
    expect(result.valid).toBe(false);
    expect(result.certificate.revoked).toBe(true);
    expect(result.certificate.revokedReason).toBe('Attendance requirements not met');
    expect(result.certificate.revokedAt).toBeTruthy();
  });
});

describe('adminService.revokeCertificate', () => {
  it('requires a non-empty reason', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);
    await expect(revokeCertificate(admin.id, cert.id, '')).rejects.toBeInstanceOf(ValidationError);
  });

  it('revokes a VALID certificate, stamping revokedAt/revokedById', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);

    const revoked = await revokeCertificate(admin.id, cert.id, 'Fraudulent submission detected');
    expect(revoked.status).toBe('REVOKED');
    expect(revoked.revokedReason).toBe('Fraudulent submission detected');
    expect(revoked.revokedAt).toBeTruthy();
    expect(revoked.revokedById).toBe(admin.id);
  });

  it('cannot revoke a certificate that is already revoked (double-revoke is rejected)', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);
    await revokeCertificate(admin.id, cert.id, 'First revocation');

    await expect(revokeCertificate(admin.id, cert.id, 'Second attempt')).rejects.toBeInstanceOf(ConflictError);
  });

  it('writes an audit log entry for the revocation', async () => {
    const { admin, attachment } = await buildCompletedAttachment();
    const cert = await issueCertificate(admin.id, attachment.id);
    await revokeCertificate(admin.id, cert.id, 'Policy violation');

    const logs = await prisma.auditLog.findMany({ where: { entity: 'Certificate', entityId: cert.id, action: 'CERTIFICATE_REVOKED' } });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].userId).toBe(admin.id);
  });
});
