import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';
import { issueCertificate } from '../src/services/placementService';
import { createStudent, createUser, createApplicationForStudent, createPlacementWithAttachment } from './helpers';
import { prisma } from '../src/utils/prisma';

function tokenFor(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

async function buildValidCertificate() {
  const admin = await createUser('AZAAM_STAFF');
  const { student } = await createStudent();
  const application = await createApplicationForStudent(student.id, { status: 'ACTIVE' });
  const { attachment } = await createPlacementWithAttachment(application.id, student.id);
  await prisma.clinicalAttachment.update({ where: { id: attachment.id }, data: { status: 'COMPLETED' } });
  const cert = await issueCertificate(admin.id, attachment.id);
  return { admin, cert };
}

describe('HTTP authorization gating', () => {
  it('rejects certificate revocation with no auth token (401)', async () => {
    const { cert } = await buildValidCertificate();
    const res = await request(app).post(`/api/v1/admin/certificates/${cert.id}/revoke`).send({ reason: 'test' });
    expect(res.status).toBe(401);
  });

  it('rejects certificate revocation from a STUDENT account (403)', async () => {
    const { cert } = await buildValidCertificate();
    const { user: studentUser } = await createStudent();
    const res = await request(app)
      .post(`/api/v1/admin/certificates/${cert.id}/revoke`)
      .set('Authorization', `Bearer ${tokenFor(studentUser.id)}`)
      .send({ reason: 'test' });
    expect(res.status).toBe(403);
  });

  it('allows certificate revocation from a SUPER_ADMIN account', async () => {
    const { cert } = await buildValidCertificate();
    const admin = await createUser('SUPER_ADMIN');
    const res = await request(app)
      .post(`/api/v1/admin/certificates/${cert.id}/revoke`)
      .set('Authorization', `Bearer ${tokenFor(admin.id)}`)
      .send({ reason: 'Policy violation confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REVOKED');
  });

  it('public certificate verification requires no auth token at all', async () => {
    const { cert } = await buildValidCertificate();
    const res = await request(app).get(`/api/v1/admin/certificates/verify?number=${cert.certificateNumber}`);
    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
  });

  it('rejects document verification from a STUDENT account (403, missing documents.verify permission)', async () => {
    const { user: studentUser } = await createStudent();
    const res = await request(app)
      .post(`/api/v1/documents/${'00000000-0000-4000-8000-000000000000'}/verify`)
      .set('Authorization', `Bearer ${tokenFor(studentUser.id)}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('rejects a request with an invalid/garbage bearer token (401)', async () => {
    const res = await request(app).get('/api/v1/notifications').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
