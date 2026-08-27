-- AlterEnum
ALTER TYPE "DocumentStatus" ADD VALUE 'SUPERSEDED';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedById" UUID;

-- AlterTable
ALTER TABLE "CertificateVerification" ADD COLUMN     "verificationCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "replacesDocumentId" UUID,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Document_replacesDocumentId_key" ON "Document"("replacesDocumentId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_replacesDocumentId_fkey" FOREIGN KEY ("replacesDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
