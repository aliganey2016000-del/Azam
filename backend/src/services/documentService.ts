import { prisma } from '../utils/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { storePrivateFile, getDownloadTarget } from './storageService';
import { notify } from './notificationService';
import { escapeHtml } from '../utils/html';

const ADMIN_ROLES = ['SUPER_ADMIN', 'AZAAM_STAFF'];

function isAdmin(roles: string[]) {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}

function sanitize(document: any) {
  const { filePath, ...rest } = document;
  return { ...rest, privateFile: Boolean(filePath) };
}

async function getAffiliationScope(userId: string, roles: string[]) {
  if (isAdmin(roles)) return { admin: true as const, universityId: null, organizationId: null };
  const [universityUser, organizationUser] = await Promise.all([
    prisma.universityUser.findUnique({ where: { userId } }),
    prisma.organizationUser.findUnique({ where: { userId } }),
  ]);
  return {
    admin: false as const,
    universityId: universityUser?.universityId ?? null,
    organizationId: organizationUser?.organizationId ?? null,
  };
}

async function getAffiliatedOwnerIds(universityId: string | null, organizationId: string | null): Promise<string[]> {
  if (!universityId && !organizationId) return [];
  const conditions = [universityId ? { universityId } : null, organizationId ? { organizationId } : null].filter(
    (c): c is { universityId: string } | { organizationId: string } => Boolean(c),
  );
  const students = await prisma.student.findMany({ where: { OR: conditions }, select: { userId: true } });
  return students.map((s) => s.userId);
}

async function loadDocumentOrThrow(id: string) {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new NotFoundError('Document not found');
  return document;
}

async function assertCanView(userId: string, roles: string[], document: { ownerId: string; uploadedById: string }) {
  if (isAdmin(roles)) return;
  if (document.ownerId === userId || document.uploadedById === userId) return;
  const scope = await getAffiliationScope(userId, roles);
  const affiliatedOwnerIds = await getAffiliatedOwnerIds(scope.universityId, scope.organizationId);
  if (affiliatedOwnerIds.includes(document.ownerId)) return;
  throw new ForbiddenError();
}

export async function listDocuments(userId: string, roles: string[]) {
  const scope = await getAffiliationScope(userId, roles);
  const where = scope.admin
    ? {}
    : {
        OR: [
          { ownerId: userId },
          { uploadedById: userId },
          ...(await getAffiliatedOwnerIds(scope.universityId, scope.organizationId)).map((ownerId) => ({ ownerId })),
        ],
      };

  const documents = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  return documents.map(sanitize);
}

export async function getDocument(userId: string, roles: string[], id: string) {
  const document = await loadDocumentOrThrow(id);
  await assertCanView(userId, roles, document);
  return sanitize(document);
}

export async function downloadDocument(userId: string, roles: string[], id: string) {
  const document = await loadDocumentOrThrow(id);
  await assertCanView(userId, roles, document);
  const target = await getDownloadTarget(document.filePath);
  return { document, target };
}

export async function createDocument(
  userId: string,
  roles: string[],
  file: Express.Multer.File,
  documentType: string,
  applicationId?: string,
) {
  if (applicationId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { student: true },
    });
    if (!application) throw new NotFoundError('Application not found');
    if (!isAdmin(roles) && application.student.userId !== userId) {
      throw new ForbiddenError();
    }
  }

  const stored = await storePrivateFile(file);

  const document = await prisma.$transaction(async (tx: any) => {
    const doc = await tx.document.create({
      data: {
        ownerId: userId,
        uploadedById: userId,
        documentType,
        fileName: stored.fileName,
        filePath: stored.key,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        applications: applicationId ? { create: { applicationId } } : undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_UPLOADED',
        entity: 'Document',
        entityId: doc.id,
        newValue: { documentType, applicationId: applicationId ?? null },
      },
    });

    return doc;
  });

  return sanitize(document);
}

/** Attaches an already-uploaded, standalone document to an application. */
export async function submitDocument(userId: string, roles: string[], documentId: string, applicationId: string) {
  const document = await loadDocumentOrThrow(documentId);
  if (!isAdmin(roles) && document.ownerId !== userId) throw new ForbiddenError();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { student: true },
  });
  if (!application) throw new NotFoundError('Application not found');
  if (!isAdmin(roles) && application.student.userId !== userId) throw new ForbiddenError();

  const existingLink = await prisma.applicationDocument.findFirst({ where: { applicationId, documentId } });
  if (existingLink) return sanitize(document);

  await prisma.$transaction(async (tx: any) => {
    await tx.applicationDocument.create({ data: { applicationId, documentId } });
    await tx.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_SUBMITTED',
        entity: 'Document',
        entityId: documentId,
        newValue: { applicationId },
      },
    });
  });

  return sanitize(document);
}

export async function verifyDocument(actorId: string, roles: string[], documentId: string, comment?: string) {
  if (!isAdmin(roles)) throw new ForbiddenError();
  const document = await loadDocumentOrThrow(documentId);
  if (document.status === 'SUPERSEDED') throw new ConflictError('Cannot verify a document that has been replaced');
  if (document.status === 'VERIFIED') throw new ConflictError('Document is already verified');

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.document.update({
      where: { id: documentId },
      data: { status: 'VERIFIED', reviewedById: actorId, reviewedAt: new Date(), rejectionReason: null },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'DOCUMENT_VERIFIED',
        entity: 'Document',
        entityId: documentId,
        oldValue: { status: document.status },
        newValue: { status: 'VERIFIED', comment: comment ?? null },
      },
    });

    await notify(tx, {
      recipientId: document.ownerId,
      title: 'Document verified',
      message: `Your ${document.documentType.replace(/_/g, ' ')} document has been verified.`,
      type: 'DOCUMENT_VERIFIED',
    });

    return sanitize(updated);
  });
}

export async function rejectDocument(actorId: string, roles: string[], documentId: string, reason: string) {
  if (!isAdmin(roles)) throw new ForbiddenError();
  const document = await loadDocumentOrThrow(documentId);
  if (document.status === 'SUPERSEDED') throw new ConflictError('Cannot reject a document that has been replaced');

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.document.update({
      where: { id: documentId },
      data: { status: 'REJECTED', reviewedById: actorId, reviewedAt: new Date(), rejectionReason: reason },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'DOCUMENT_REJECTED',
        entity: 'Document',
        entityId: documentId,
        oldValue: { status: document.status },
        newValue: { status: 'REJECTED', reason },
      },
    });

    await notify(tx, {
      recipientId: document.ownerId,
      title: 'Document rejected',
      message: `Your ${document.documentType.replace(/_/g, ' ')} document was rejected: ${reason}`,
      type: 'DOCUMENT_REJECTED',
      email: {
        subject: 'Action needed: a submitted document was rejected',
        html: `<p>One of your submitted documents (<strong>${escapeHtml(document.documentType)}</strong>) was rejected during review.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p>Please upload a corrected document to continue your application.</p>`,
      },
    });

    return sanitize(updated);
  });
}

/** Re-uploads a document to replace a rejected/expired one, preserving history via SUPERSEDED. */
export async function replaceDocument(userId: string, roles: string[], documentId: string, file: Express.Multer.File) {
  const original = await loadDocumentOrThrow(documentId);
  if (!isAdmin(roles) && original.ownerId !== userId) throw new ForbiddenError();
  if (original.status === 'SUPERSEDED') throw new ConflictError('This document has already been replaced');
  if (original.status === 'VERIFIED') {
    throw new ConflictError('A verified document cannot be replaced directly; contact AZAAM staff if it must be reissued');
  }

  const stored = await storePrivateFile(file);

  const replacement = await prisma.$transaction(async (tx: any) => {
    const applicationLinks = await tx.applicationDocument.findMany({ where: { documentId } });

    const created = await tx.document.create({
      data: {
        ownerId: original.ownerId,
        uploadedById: userId,
        documentType: original.documentType,
        fileName: stored.fileName,
        filePath: stored.key,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        replacesDocumentId: original.id,
        applications: applicationLinks.length
          ? { create: applicationLinks.map((link: any) => ({ applicationId: link.applicationId })) }
          : undefined,
      },
    });

    await tx.document.update({ where: { id: original.id }, data: { status: 'SUPERSEDED' } });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_REPLACED',
        entity: 'Document',
        entityId: created.id,
        oldValue: { replaces: original.id, previousStatus: original.status },
        newValue: { documentType: original.documentType },
      },
    });

    return created;
  });

  return sanitize(replacement);
}
