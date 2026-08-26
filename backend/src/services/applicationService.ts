import { randomBytes } from 'node:crypto';
import { ApplicationStatus, StudentSource } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import type { ApplicationCreateInput } from '../validators/application';

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['DOCUMENTS_REQUIRED', 'APPROVED', 'REJECTED'],
  DOCUMENTS_REQUIRED: ['SUBMITTED', 'REJECTED'],
  APPROVED: ['PLACEMENT_PENDING'],
  PLACEMENT_PENDING: [],
  PLACED: [],
  SUPERVISOR_ASSIGNED: [],
  ACTIVE: [],
  COMPLETED: [],
  CERTIFICATE_ISSUED: [],
  REJECTED: [],
};

function generateApplicationNumber() {
  const year = new Date().getFullYear();
  const entropy = randomBytes(8).toString('hex').toUpperCase();
  return `AZM-${year}-${entropy}`;
}

export async function listApplications(userId: string, roles: string[]) {
  const where = roles.includes('SUPER_ADMIN') || roles.includes('AZAAM_STAFF')
    ? {}
    : { student: { userId } };

  return prisma.application.findMany({
    where,
    include: {
      student: true,
      programme: true,
      specialty: true,
      university: true,
      organization: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createApplication(userId: string, input: ApplicationCreateInput) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new NotFoundError('Student profile not found');

  if (student.source !== input.source) {
    throw new ConflictError('Application source must match the student profile source');
  }

  if (input.source === 'INDEPENDENT' && (input.universityId || input.organizationId)) {
    throw new ConflictError('Independent applicants cannot have an affiliation');
  }

  if (input.source === 'UNIVERSITY' && input.universityId !== student.universityId) {
    throw new ConflictError('University affiliation must match the student profile');
  }

  if (input.source === 'ORGANIZATION' && input.organizationId !== student.organizationId) {
    throw new ConflictError('Organization affiliation must match the student profile');
  }

  const applicationNumber = generateApplicationNumber();

  return prisma.application.create({
    data: {
      source: input.source as StudentSource,
      universityId: input.universityId ?? null,
      organizationId: input.organizationId ?? null,
      programmeId: input.programmeId ?? null,
      specialtyId: input.specialtyId ?? null,
      preferredCountryId: input.preferredCountryId ?? null,
      preferredCityId: input.preferredCityId ?? null,
      preferredStartDate: input.preferredStartDate ?? null,
      preferredEndDate: input.preferredEndDate ?? null,
      clinicalInterests: input.clinicalInterests,
      preferredInstitutionId: input.preferredInstitutionId ?? null,
      noPreferredInstitution: input.noPreferredInstitution,
      applicationNumber,
      studentId: student.id,
    },
    include: { student: true, organization: true },
  });
}

export async function getApplication(userId: string, roles: string[], id: string) {
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      documents: { include: { document: true } },
      history: true,
      programme: true,
      specialty: true,
      university: true,
      organization: true,
    },
  });

  if (!app) throw new NotFoundError();

  if (!roles.some((role) => ['SUPER_ADMIN', 'AZAAM_STAFF'].includes(role)) && app.student.userId !== userId) {
    throw new ForbiddenError();
  }

  return app;
}

export async function transitionApplication(
  actorId: string,
  roles: string[],
  id: string,
  target: ApplicationStatus,
  comment?: string,
) {
  const app = await getApplication(actorId, roles, id);

  if (!roles.some((role) => ['SUPER_ADMIN', 'AZAAM_STAFF'].includes(role)) && target !== 'SUBMITTED') {
    throw new ForbiddenError();
  }

  if (!transitions[app.status].includes(target)) {
    throw new ConflictError(`Cannot change application from ${app.status} to ${target}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        status: target,
        rejectedReason: target === 'REJECTED' ? comment : undefined,
        rejectedAt: target === 'REJECTED' ? new Date() : undefined,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: app.status,
        toStatus: target,
        changedById: actorId,
        comment,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: `APPLICATION_${target}`,
        entity: 'Application',
        entityId: id,
        newValue: { status: target },
      },
    });

    await tx.notification.create({
      data: {
        recipientId: app.student.userId,
        title: `Application ${target.toLowerCase()}`,
        message: comment ?? `Your application status is now ${target}.`,
        type: 'APPLICATION',
      },
    });

    return updated;
  });
}
