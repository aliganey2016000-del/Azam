import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/utils/prisma';
import {
  createDocument,
  getDocument,
  downloadDocument,
  verifyDocument,
  rejectDocument,
  replaceDocument,
  listDocuments,
} from '../src/services/documentService';
import { storePrivateFile } from '../src/services/storageService';
import { ForbiddenError, ConflictError, ValidationError, NotFoundError } from '../src/utils/errors';
import {
  createStudent,
  createUser,
  createApplicationForStudent,
  getDemoUniversity,
  getDemoOrganization,
  fakeMulterFile,
} from './helpers';

describe('storageService.storePrivateFile validation', () => {
  it('rejects a disallowed mime type', async () => {
    await expect(storePrivateFile(fakeMulterFile({ mimetype: 'application/zip' }))).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects a file whose content does not match its declared mime type', async () => {
    const file = fakeMulterFile({ mimetype: 'application/pdf', buffer: Buffer.from('not actually a pdf') });
    await expect(storePrivateFile(file)).rejects.toBeInstanceOf(ValidationError);
  });

  it('accepts a valid PDF', async () => {
    const stored = await storePrivateFile(fakeMulterFile());
    expect(stored.key).toBeTruthy();
    expect(stored.mimeType).toBe('application/pdf');
  });
});

describe('documentService authorization and resource scoping', () => {
  it('lets a student view and download their own document', async () => {
    const { user, student } = await createStudent();
    const doc = await createDocument(user.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    const fetched = await getDocument(user.id, ['STUDENT'], doc.id);
    expect(fetched.id).toBe(doc.id);
    expect(fetched).not.toHaveProperty('filePath');

    const download = await downloadDocument(user.id, ['STUDENT'], doc.id);
    expect(download.target.type === 'stream' || download.target.type === 'redirect').toBe(true);
    void student;
  });

  it('denies a different student from viewing someone else document', async () => {
    const { user: ownerUser } = await createStudent();
    const { user: otherUser } = await createStudent();
    const doc = await createDocument(ownerUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    await expect(getDocument(otherUser.id, ['STUDENT'], doc.id)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(downloadDocument(otherUser.id, ['STUDENT'], doc.id)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lets an affiliated university staff member view a document belonging to their own university student', async () => {
    const university = await getDemoUniversity();
    const uniStaffUser = await createUser('UNIVERSITY_USER');
    await prisma.universityUser.create({ data: { userId: uniStaffUser.id, universityId: university.id } });

    const { user: studentUser } = await createStudent({ source: 'UNIVERSITY', universityId: university.id });
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    const fetched = await getDocument(uniStaffUser.id, ['UNIVERSITY_USER'], doc.id);
    expect(fetched.id).toBe(doc.id);
  });

  it('denies a university staff member from a DIFFERENT university', async () => {
    // A second, unaffiliated university so the staff member below has no relationship to the
    // student's document at all.
    const otherUniversity = await prisma.university.create({ data: { name: `Other University ${randomUUID()}`, status: 'APPROVED' } });
    const uniStaffUser = await createUser('UNIVERSITY_USER');
    await prisma.universityUser.create({ data: { userId: uniStaffUser.id, universityId: otherUniversity.id } });

    const university = await getDemoUniversity();
    const { user: studentUser } = await createStudent({ source: 'UNIVERSITY', universityId: university.id });
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    await expect(getDocument(uniStaffUser.id, ['UNIVERSITY_USER'], doc.id)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('denies organization staff from viewing a document belonging to an unaffiliated student', async () => {
    const organization = await getDemoOrganization();
    const orgStaffUser = await createUser('ORGANIZATION_USER');
    await prisma.organizationUser.create({ data: { userId: orgStaffUser.id, organizationId: organization.id } });

    const { user: studentUser } = await createStudent(); // INDEPENDENT, no organization affiliation
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    await expect(getDocument(orgStaffUser.id, ['ORGANIZATION_USER'], doc.id)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('SUPER_ADMIN can view and list any document', async () => {
    const admin = await createUser('SUPER_ADMIN');
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'CV');

    const fetched = await getDocument(admin.id, ['SUPER_ADMIN'], doc.id);
    expect(fetched.id).toBe(doc.id);

    const list = await listDocuments(admin.id, ['SUPER_ADMIN']);
    expect(list.some((d: any) => d.id === doc.id)).toBe(true);
  });

  it('a student only sees their own documents in listDocuments', async () => {
    const { user: studentA } = await createStudent();
    const { user: studentB } = await createStudent();
    await createDocument(studentA.id, ['STUDENT'], fakeMulterFile(), 'CV');
    await createDocument(studentB.id, ['STUDENT'], fakeMulterFile(), 'CV');

    const listA = await listDocuments(studentA.id, ['STUDENT']);
    expect(listA.every((d: any) => d.ownerId === studentA.id)).toBe(true);
  });
});

describe('documentService verify / reject workflow', () => {
  it('only an admin role can verify a document', async () => {
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await expect(verifyDocument(studentUser.id, ['STUDENT'], doc.id)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('verifying sets status, reviewer, and timestamp; verifying twice conflicts', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    const verified = await verifyDocument(admin.id, ['AZAAM_STAFF'], doc.id, 'looks good');
    expect(verified.status).toBe('VERIFIED');
    expect(verified.reviewedById).toBe(admin.id);
    expect(verified.reviewedAt).toBeTruthy();

    await expect(verifyDocument(admin.id, ['AZAAM_STAFF'], doc.id)).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejecting requires a reason and records it', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');

    const rejected = await rejectDocument(admin.id, ['AZAAM_STAFF'], doc.id, 'Photo is blurry');
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.rejectionReason).toBe('Photo is blurry');
    expect(rejected.reviewedById).toBe(admin.id);
  });

  it('a non-admin cannot reject a document', async () => {
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await expect(rejectDocument(studentUser.id, ['STUDENT'], doc.id, 'nope')).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('documentService.replaceDocument (supersede flow)', () => {
  it('replacing a rejected document creates a new document and marks the old one SUPERSEDED', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user: studentUser } = await createStudent();
    const original = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await rejectDocument(admin.id, ['AZAAM_STAFF'], original.id, 'Expired document');

    const replacement = await replaceDocument(studentUser.id, ['STUDENT'], original.id, fakeMulterFile());
    expect(replacement.replacesDocumentId).toBe(original.id);
    expect(replacement.status).toBe('PENDING');
    expect(replacement.documentType).toBe('PASSPORT');

    const oldAfter = await prisma.document.findUniqueOrThrow({ where: { id: original.id } });
    expect(oldAfter.status).toBe('SUPERSEDED');
  });

  it('cannot replace a VERIFIED document directly', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user: studentUser } = await createStudent();
    const doc = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await verifyDocument(admin.id, ['AZAAM_STAFF'], doc.id);

    await expect(replaceDocument(studentUser.id, ['STUDENT'], doc.id, fakeMulterFile())).rejects.toBeInstanceOf(ConflictError);
  });

  it('a different student cannot replace someone else document', async () => {
    const { user: ownerUser } = await createStudent();
    const { user: otherUser } = await createStudent();
    const doc = await createDocument(ownerUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await expect(replaceDocument(otherUser.id, ['STUDENT'], doc.id, fakeMulterFile())).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('cannot replace an already-superseded document', async () => {
    const admin = await createUser('AZAAM_STAFF');
    const { user: studentUser } = await createStudent();
    const original = await createDocument(studentUser.id, ['STUDENT'], fakeMulterFile(), 'PASSPORT');
    await rejectDocument(admin.id, ['AZAAM_STAFF'], original.id, 'bad scan');
    await replaceDocument(studentUser.id, ['STUDENT'], original.id, fakeMulterFile());

    await expect(replaceDocument(studentUser.id, ['STUDENT'], original.id, fakeMulterFile())).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('unknown document id', () => {
  it('throws NotFoundError', async () => {
    const { user: studentUser } = await createStudent();
    await expect(getDocument(studentUser.id, ['STUDENT'], randomUUID())).rejects.toBeInstanceOf(NotFoundError);
  });
});
