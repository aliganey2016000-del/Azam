import { describe, it, expect } from 'vitest';
import { getApplicationDocumentEligibility, MANDATORY_DOCUMENT_TYPES } from '../src/services/documentRequirementService';
import { createDocument, verifyDocument, rejectDocument } from '../src/services/documentService';
import { transitionApplication } from '../src/services/applicationService';
import { ConflictError } from '../src/utils/errors';
import { createStudent, createUser, createApplicationForStudent, fakeMulterFile } from './helpers';

async function attachAndUpload(studentUserId: string, applicationId: string, documentType: string) {
  return createDocument(studentUserId, ['STUDENT'], fakeMulterFile(), documentType, applicationId);
}

describe('documentRequirementService.getApplicationDocumentEligibility', () => {
  it('reports DOCUMENTS_REQUIRED with all types MISSING for a brand-new application', async () => {
    const { student } = await createStudent();
    const application = await createApplicationForStudent(student.id);

    const result = await getApplicationDocumentEligibility(application.id);
    expect(result.verdict).toBe('DOCUMENTS_REQUIRED');
    expect(result.missingTypes.sort()).toEqual([...MANDATORY_DOCUMENT_TYPES].sort());
  });

  it('reports NOT_ELIGIBLE once every mandatory type is submitted but still pending review', async () => {
    const { user, student } = await createStudent();
    const application = await createApplicationForStudent(student.id);
    for (const type of MANDATORY_DOCUMENT_TYPES) {
      await attachAndUpload(user.id, application.id, type);
    }

    const result = await getApplicationDocumentEligibility(application.id);
    expect(result.verdict).toBe('NOT_ELIGIBLE');
    expect(result.missingTypes).toHaveLength(0);
  });

  it('reports DOCUMENTS_REQUIRED when a mandatory document was rejected', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user, student } = await createStudent();
    const application = await createApplicationForStudent(student.id);
    const docs = [];
    for (const type of MANDATORY_DOCUMENT_TYPES) {
      docs.push(await attachAndUpload(user.id, application.id, type));
    }
    await rejectDocument(admin.id, ['AZAAM_STAFF'], docs[0].id, 'not legible');

    const result = await getApplicationDocumentEligibility(application.id);
    expect(result.verdict).toBe('DOCUMENTS_REQUIRED');
    expect(result.rejectedTypes).toContain(docs[0].documentType);
  });

  it('reports ELIGIBLE once every mandatory type is VERIFIED', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user, student } = await createStudent();
    const application = await createApplicationForStudent(student.id);
    for (const type of MANDATORY_DOCUMENT_TYPES) {
      const doc = await attachAndUpload(user.id, application.id, type);
      await verifyDocument(admin.id, ['AZAAM_STAFF'], doc.id);
    }

    const result = await getApplicationDocumentEligibility(application.id);
    expect(result.verdict).toBe('ELIGIBLE');
    expect(result.requirements.every((r) => r.status === 'VERIFIED')).toBe(true);
  });
});

describe('applicationService.transitionApplication APPROVED gating', () => {
  it('refuses to approve an application with missing mandatory documents', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { student } = await createStudent();
    const application = await createApplicationForStudent(student.id, { status: 'UNDER_REVIEW' });

    await expect(
      transitionApplication(admin.id, ['AZAAM_STAFF'], application.id, 'APPROVED' as any),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('approves once all mandatory documents are verified', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user, student } = await createStudent();
    const application = await createApplicationForStudent(student.id, { status: 'UNDER_REVIEW' });
    for (const type of MANDATORY_DOCUMENT_TYPES) {
      const doc = await attachAndUpload(user.id, application.id, type);
      await verifyDocument(admin.id, ['AZAAM_STAFF'], doc.id);
    }

    const updated = await transitionApplication(admin.id, ['AZAAM_STAFF'], application.id, 'APPROVED' as any);
    expect(updated.status).toBe('APPROVED');
  });
});
