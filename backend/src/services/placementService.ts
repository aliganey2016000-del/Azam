import { randomBytes } from 'node:crypto';
import { prisma } from '../utils/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';

export interface CreatePlacementInput {
  applicationId: string;
  organizationId: string;
  departmentId: string;
  specialtyId?: string;
  supervisorId?: string;
  startDate: string;
  endDate: string;
}

export async function createPlacement(actorId: string, roles: string[], input: CreatePlacementInput) {
  const app = await prisma.application.findUnique({
    where: { id: input.applicationId },
    include: { student: true },
  });

  if (!app) throw new NotFoundError('Application not found');

  if (!['APPROVED', 'PLACEMENT_PENDING'].includes(app.status)) {
    throw new ConflictError(`Application must be in APPROVED or PLACEMENT_PENDING status to place student. Current: ${app.status}`);
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (endDate <= startDate) {
    throw new ConflictError('Placement end date must be after start date');
  }

  return prisma.$transaction(async (tx: any) => {
    // Check student overlap
    const studentOverlap = await tx.placement.findFirst({
      where: {
        studentId: app.studentId,
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE', 'SUPERVISOR_ASSIGNED', 'PLACED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (studentOverlap) {
      throw new ConflictError('Student already has an active clinical placement overlapping with the requested rotation dates');
    }

    if (input.supervisorId) {
      const sup = await tx.supervisor.findUnique({ where: { id: input.supervisorId } });
      if (!sup) throw new NotFoundError('Supervisor not found');
      if (sup.organizationId !== input.organizationId) {
        throw new ForbiddenError('Supervisor must belong to the placement healthcare organization');
      }
    }

    // Capacity Check in Transaction
    const activeCount = await tx.placement.count({
      where: {
        organizationId: input.organizationId,
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE', 'SUPERVISOR_ASSIGNED', 'PLACED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    const MAX_CAPACITY = 20; // Maximum allowed clinical slots per healthcare facility
    if (activeCount >= MAX_CAPACITY) {
      throw new ConflictError(`Facility capacity limit of ${MAX_CAPACITY} active slots reached for the selected clinical period.`);
    }

    const newStatus = input.supervisorId ? 'SUPERVISOR_ASSIGNED' : 'PLACED';

    const placement = await tx.placement.create({
      data: {
        applicationId: input.applicationId,
        studentId: app.studentId,
        organizationId: input.organizationId,
        departmentId: input.departmentId,
        specialtyId: input.specialtyId ?? null,
        supervisorId: input.supervisorId ?? null,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
      include: {
        student: true,
        organization: true,
        department: true,
        specialty: true,
        supervisor: { include: { user: true } },
      },
    });

    const attachment = await tx.clinicalAttachment.create({
      data: {
        placementId: placement.id,
        status: 'IN_PROGRESS',
      },
    });

    await tx.application.update({
      where: { id: input.applicationId },
      data: { status: newStatus as any },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: input.applicationId,
        fromStatus: app.status as any,
        toStatus: newStatus as any,
        changedById: actorId,
        comment: `Placed at ${placement.organization.name} (${placement.department.name})`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'PLACEMENT_CREATED',
        entity: 'Placement',
        entityId: placement.id,
        newValue: { organizationId: input.organizationId, departmentId: input.departmentId, startDate, endDate },
      },
    });

    await tx.notification.create({
      data: {
        recipientId: app.student.userId,
        title: 'Clinical Placement Confirmed',
        message: `Your clinical attachment at ${placement.organization.name} has been assigned starting ${startDate.toISOString().split('T')[0]}.`,
        type: 'PLACEMENT',
      },
    });

    return { placement, attachment };
  });
}

export async function assignSupervisorToPlacement(actorId: string, placementId: string, supervisorId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { application: true, student: true, organization: true },
  });

  if (!placement) throw new NotFoundError('Placement record not found');

  const supervisor = await prisma.supervisor.findUnique({
    where: { id: supervisorId },
    include: { user: true },
  });

  if (!supervisor) throw new NotFoundError('Supervisor not found');

  if (supervisor.organizationId !== placement.organizationId) {
    throw new ForbiddenError('Supervisor must belong to the placement healthcare organization');
  }

  return prisma.$transaction(async (tx: any) => {
    const updatedPlacement = await tx.placement.update({
      where: { id: placementId },
      data: {
        supervisorId,
        status: 'SUPERVISOR_ASSIGNED',
      },
      include: { supervisor: { include: { user: true } } },
    });

    await tx.application.update({
      where: { id: placement.applicationId },
      data: { status: 'SUPERVISOR_ASSIGNED' },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'SUPERVISOR_ASSIGNED',
        entity: 'Placement',
        entityId: placementId,
        newValue: { supervisorId, supervisorName: supervisor.user.fullName },
      },
    });

    await tx.notification.create({
      data: {
        recipientId: placement.student.userId,
        title: 'Preceptor Assigned',
        message: `Clinical Preceptor ${supervisor.user.fullName} has been assigned to oversee your rotation.`,
        type: 'SUPERVISOR',
      },
    });

    return updatedPlacement;
  });
}

export async function recordAttendance(attachmentId: string, dateStr: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED', comment?: string) {
  const attachment = await prisma.clinicalAttachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) throw new NotFoundError('Clinical attachment not found');

  const date = new Date(dateStr);

  return prisma.attendance.upsert({
    where: {
      attachmentId_date: {
        attachmentId,
        date,
      },
    },
    create: {
      attachmentId,
      date,
      status,
      checkIn: status === 'PRESENT' ? new Date() : null,
      comment,
    },
    update: {
      status,
      checkOut: status === 'PRESENT' ? new Date() : null,
      comment,
    },
  });
}

export async function submitLogbookEntry(attachmentId: string, dateStr: string, clinicalArea: string, content: any) {
  const attachment = await prisma.clinicalAttachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) throw new NotFoundError('Clinical attachment not found');

  return prisma.logbookEntry.create({
    data: {
      attachmentId,
      date: new Date(dateStr),
      clinicalArea,
      content,
      status: 'SUBMITTED',
    },
  });
}

export async function reviewLogbookEntry(logbookId: string, status: 'APPROVED' | 'REVISION_REQUESTED', comment?: string) {
  const entry = await prisma.logbookEntry.findUnique({ where: { id: logbookId } });
  if (!entry) throw new NotFoundError('Logbook entry not found');

  return prisma.logbookEntry.update({
    where: { id: logbookId },
    data: {
      status,
      supervisorComment: comment,
    },
  });
}

export async function submitEvaluation(
  attachmentId: string,
  type: 'MID_TERM' | 'FINAL',
  submittedById: string,
  scores: Array<{ category: string; score: number; maximum: number; comment?: string }>
) {
  const attachment = await prisma.clinicalAttachment.findUnique({
    where: { id: attachmentId },
    include: { placement: { include: { application: true, student: true } } },
  });

  if (!attachment) throw new NotFoundError('Clinical attachment not found');

  return prisma.$transaction(async (tx: any) => {
    const evaluation = await tx.evaluation.upsert({
      where: {
        attachmentId_type: { attachmentId, type },
      },
      create: {
        attachmentId,
        type,
        status: 'SUBMITTED',
        submittedById,
      },
      update: {
        status: 'SUBMITTED',
      },
    });

    // Replace scores
    await tx.evaluationScore.deleteMany({ where: { evaluationId: evaluation.id } });

    for (const s of scores) {
      await tx.evaluationScore.create({
        data: {
          evaluationId: evaluation.id,
          category: s.category,
          score: s.score,
          maximum: s.maximum,
          comment: s.comment,
        },
      });
    }

    if (type === 'FINAL') {
      await tx.clinicalAttachment.update({
        where: { id: attachmentId },
        data: { status: 'COMPLETED' },
      });

      await tx.application.update({
        where: { id: attachment.placement.applicationId },
        data: { status: 'COMPLETED' },
      });
    }

    return evaluation;
  });
}

export async function issueCertificate(actorId: string, attachmentId: string) {
  const attachment = await prisma.clinicalAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      placement: {
        include: {
          student: true,
          organization: true,
          application: true,
        },
      },
      certificate: true,
    },
  });

  if (!attachment) throw new NotFoundError('Clinical attachment not found');
  if (attachment.status !== 'COMPLETED') {
    throw new ConflictError('Cannot issue certificate until clinical attachment is in COMPLETED status');
  }
  if (attachment.certificate) {
    return attachment.certificate;
  }

  const year = new Date().getFullYear();
  const hex = randomBytes(4).toString('hex').toUpperCase();
  const certificateNumber = `AZM-CERT-${year}-${hex}`;

  return prisma.$transaction(async (tx: any) => {
    const cert = await tx.certificate.create({
      data: {
        certificateNumber,
        attachmentId,
        status: 'VALID',
        issueDate: new Date(),
      },
    });

    await tx.certificateVerification.create({
      data: {
        certificateId: cert.id,
        lastVerifiedAt: new Date(),
      },
    });

    await tx.application.update({
      where: { id: attachment.placement.applicationId },
      data: { status: 'CERTIFICATE_ISSUED' },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'CERTIFICATE_ISSUED',
        entity: 'Certificate',
        entityId: cert.id,
        newValue: { certificateNumber, studentId: attachment.placement.studentId },
      },
    });

    await tx.notification.create({
      data: {
        recipientId: attachment.placement.student.userId,
        title: 'Clinical Certificate Issued',
        message: `Your verified certificate (${certificateNumber}) is ready for download.`,
        type: 'CERTIFICATE',
      },
    });

    return cert;
  });
}
