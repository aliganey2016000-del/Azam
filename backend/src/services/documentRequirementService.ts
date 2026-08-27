import { prisma } from '../utils/prisma';

// Baseline mandatory document set applied to every application regardless of source
// (UNIVERSITY / ORGANIZATION / INDEPENDENT). These three types are already collected by the
// existing application wizard (frontend/src/pages/ApplicationWizard.tsx), so this rule does not
// require any new document type to be uploaded for approval to become possible. This is a
// reasonable default business rule rather than a fixed platform constant -- if per-programme or
// per-source requirements are needed later, this is the single place to extend (e.g. by reading
// from SystemSetting), without touching the applicationService approval flow that consumes it.
export const MANDATORY_DOCUMENT_TYPES = ['PASSPORT', 'STUDENT_ID', 'CV'] as const;

export type DocumentRequirementStatus = 'MISSING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
export type EligibilityVerdict = 'ELIGIBLE' | 'DOCUMENTS_REQUIRED' | 'NOT_ELIGIBLE';

export interface DocumentRequirementItem {
  documentType: string;
  required: boolean;
  status: DocumentRequirementStatus;
  documentId?: string;
}

export interface DocumentEligibilityResult {
  verdict: EligibilityVerdict;
  requirements: DocumentRequirementItem[];
  missingTypes: string[];
  rejectedTypes: string[];
}

/**
 * Computes per-document-type status (MISSING/SUBMITTED/VERIFIED/REJECTED) for the mandatory
 * document set on a given application, plus an overall verdict:
 *  - ELIGIBLE: every mandatory type has a VERIFIED document attached.
 *  - DOCUMENTS_REQUIRED: at least one mandatory type is MISSING or REJECTED -- the applicant
 *    needs to take action (upload or replace a document).
 *  - NOT_ELIGIBLE: every mandatory type has a document attached and none are rejected, but at
 *    least one is still awaiting staff verification (status PENDING) -- action is needed from a
 *    reviewer, not the applicant.
 */
export async function getApplicationDocumentEligibility(applicationId: string): Promise<DocumentEligibilityResult> {
  const links = await prisma.applicationDocument.findMany({
    where: { applicationId },
    include: { document: true },
  });

  const documents = links.map((link) => link.document).filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

  const requirements: DocumentRequirementItem[] = MANDATORY_DOCUMENT_TYPES.map((type) => {
    // A document may have been replaced (status SUPERSEDED); prefer the most recently uploaded
    // document of this type so a re-upload after rejection is reflected correctly.
    const candidates = documents
      .filter((doc) => doc.documentType === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = candidates[0];

    if (!latest) {
      return { documentType: type, required: true, status: 'MISSING' };
    }

    const status: DocumentRequirementStatus =
      latest.status === 'VERIFIED' ? 'VERIFIED' : latest.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED';

    return { documentType: type, required: true, status, documentId: latest.id };
  });

  const missingTypes = requirements.filter((r) => r.status === 'MISSING').map((r) => r.documentType);
  const rejectedTypes = requirements.filter((r) => r.status === 'REJECTED').map((r) => r.documentType);
  const allVerified = requirements.every((r) => r.status === 'VERIFIED');

  const verdict: EligibilityVerdict = allVerified
    ? 'ELIGIBLE'
    : missingTypes.length > 0 || rejectedTypes.length > 0
      ? 'DOCUMENTS_REQUIRED'
      : 'NOT_ELIGIBLE';

  return { verdict, requirements, missingTypes, rejectedTypes };
}
