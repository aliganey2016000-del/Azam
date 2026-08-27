import { prisma } from '../utils/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { storePrivateFile } from './storageService';

export async function listDocuments(userId: string, roles: string[]) {
  const documents = await prisma.document.findMany({
    where: roles.some((role) => ['SUPER_ADMIN', 'AZAAM_STAFF'].includes(role)) ? {} : { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return documents.map((doc: any) => {
    const { filePath, ...document } = doc;
    return { ...document, privateFile: Boolean(filePath) };
  });
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
    if (!roles.some((role) => ['SUPER_ADMIN', 'AZAAM_STAFF'].includes(role)) && application.student.userId !== userId) {
      throw new ForbiddenError();
    }
  }
  const stored = await storePrivateFile(file);
  const document = await prisma.document.create({
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
  const { filePath, ...safeDocument } = document;
  return { ...safeDocument, privateFile: Boolean(filePath) };
}
