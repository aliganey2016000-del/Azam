import { prisma } from '../utils/prisma';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { notify, listNotificationsForUser, markNotificationReadForUser, markAllNotificationsReadForUser } from './notificationService';
import { escapeHtml } from '../utils/html';

export async function getAdminStudents() {
  return prisma.student.findMany({
    include: {
      user: true,
      university: true,
      organization: true,
      programme: true,
      country: true,
      applications: true,
      placements: true,
    },
    orderBy: { fullName: 'asc' },
  });
}

export async function getAdminStudent(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      university: true,
      organization: true,
      programme: true,
      country: true,
      applications: {
        include: {
          specialty: true,
          university: true,
          organization: true,
        },
      },
      placements: {
        include: {
          organization: true,
          department: true,
          specialty: true,
          supervisor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  if (!student) throw new NotFoundError('Student record not found');
  return student;
}

export async function getAdminUniversities() {
  const universities = await prisma.university.findMany({
    include: {
      students: true,
      applications: true,
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  return universities.map((u: any) => ({
    ...u,
    studentsCount: u.students?.length || 0,
    applicationsCount: u.applications?.length || 0,
  }));
}

export async function getAdminOrganizations() {
  const organizations = await prisma.organization.findMany({
    include: {
      departments: true,
      supervisors: {
        include: {
          user: true,
        },
      },
      placements: {
        include: {
          student: true,
        },
      },
      applications: true,
    },
    orderBy: { name: 'asc' },
  });

  return organizations.map((org: any) => {
    const activePlacements = (org.placements || []).filter((p: any) => p.status === 'ACTIVE' || p.status === 'APPROVED');
    const totalCapacity = 20; // Default allocated rotation slots per organization
    const occupiedCapacity = activePlacements.length;
    const availableCapacity = Math.max(0, totalCapacity - occupiedCapacity);

    return {
      ...org,
      departmentsCount: org.departments?.length || 0,
      supervisorsCount: org.supervisors?.length || 0,
      applicationsCount: org.applications?.length || 0,
      totalCapacity,
      occupiedCapacity,
      availableCapacity,
      capacityWarning: occupiedCapacity >= totalCapacity,
    };
  });
}

export async function getAdminSupervisors() {
  return prisma.supervisor.findMany({
    include: {
      user: true,
      organization: true,
      placements: {
        include: {
          student: true,
          department: true,
          specialty: true,
        },
      },
    },
  });
}

export async function getAdminProgrammes() {
  return prisma.programme.findMany({
    include: {
      students: true,
      applications: true,
    },
  });
}

export async function getAdminSpecialties() {
  return prisma.specialty.findMany({
    include: {
      applications: true,
      placements: true,
    },
  });
}

export async function getAdminPlacements() {
  return prisma.placement.findMany({
    include: {
      student: true,
      organization: true,
      department: true,
      specialty: true,
      supervisor: {
        include: {
          user: true,
        },
      },
      application: true,
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function getAdminAttendance() {
  return prisma.attendance.findMany({
    include: {
      attachment: {
        include: {
          placement: {
            include: {
              student: true,
              organization: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getAdminLogbooks() {
  return prisma.logbookEntry.findMany({
    include: {
      attachment: {
        include: {
          placement: {
            include: {
              student: true,
              organization: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getAdminEvaluations() {
  return prisma.evaluation.findMany({
    include: {
      scores: true,
      attachment: {
        include: {
          placement: {
            include: {
              student: true,
              organization: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminCertificates() {
  return prisma.certificate.findMany({
    include: {
      attachment: {
        include: {
          placement: {
            include: {
              student: true,
              organization: true,
            },
          },
        },
      },
      verification: true,
    },
    orderBy: { issueDate: 'desc' },
  });
}

export async function verifyCertificate(certificateNumber: string) {
  if (!certificateNumber || !certificateNumber.trim()) {
    return { valid: false, message: 'No certificate found with this verification number.' };
  }

  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      attachment: {
        include: {
          placement: {
            include: {
              student: true,
              organization: true,
            },
          },
        },
      },
      verification: true,
    },
  });

  if (!cert) {
    return { valid: false, message: 'No certificate found with this verification number.' };
  }

  const now = new Date();

  // This is a PUBLIC, unauthenticated endpoint -- record the check (updating lastVerifiedAt /
  // verificationCount) and log it with a null actor, since there is no authenticated user to
  // attribute the audit entry to.
  await prisma.$transaction(async (tx: any) => {
    if (cert.verification) {
      await tx.certificateVerification.update({
        where: { certificateId: cert.id },
        data: { lastVerifiedAt: now, verificationCount: { increment: 1 } },
      });
    } else {
      await tx.certificateVerification.create({
        data: { certificateId: cert.id, lastVerifiedAt: now, verificationCount: 1 },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: null,
        action: 'CERTIFICATE_VERIFIED',
        entity: 'Certificate',
        entityId: cert.id,
        newValue: { certificateNumber, status: cert.status },
      },
    });
  });

  if (cert.status === 'REVOKED') {
    return {
      valid: false,
      certificate: {
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        status: cert.status,
        revoked: true,
        revokedAt: cert.revokedAt,
        revokedReason: cert.revokedReason,
      },
      message: 'This certificate has been revoked and is no longer valid.',
    };
  }

  return {
    valid: cert.status === 'VALID',
    certificate: {
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      status: cert.status,
      issueDate: cert.issueDate,
      studentName: cert.attachment?.placement?.student?.fullName || 'Student Doctor',
      organizationName: cert.attachment?.placement?.organization?.name || 'Healthcare Organization',
      lastVerifiedAt: now,
    },
  };
}

export async function revokeCertificate(actorId: string, id: string, reason: string) {
  if (!reason || !reason.trim()) {
    throw new ValidationError([{ message: 'A reason is required to revoke a certificate' }]);
  }

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { attachment: { include: { placement: { include: { student: true } } } } },
  });
  if (!cert) throw new NotFoundError('Certificate not found');
  if (cert.status !== 'VALID') {
    throw new ConflictError(`Only a VALID certificate can be revoked (current status: ${cert.status})`);
  }

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.certificate.update({
      where: { id },
      data: { status: 'REVOKED', revokedReason: reason, revokedAt: new Date(), revokedById: actorId },
    });

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: 'CERTIFICATE_REVOKED',
        entity: 'Certificate',
        entityId: id,
        oldValue: { status: cert.status },
        newValue: { status: 'REVOKED', reason },
      },
    });

    const studentUserId = cert.attachment?.placement?.student?.userId;
    if (studentUserId) {
      await notify(tx, {
        recipientId: studentUserId,
        title: 'Certificate Revoked',
        message: `Your certificate ${cert.certificateNumber} has been revoked. Reason: ${reason}`,
        type: 'CERTIFICATE_REVOKED',
        email: {
          subject: 'Your AZAAM certificate has been revoked',
          html: `<p>Your clinical attachment certificate <strong>${escapeHtml(cert.certificateNumber)}</strong> has been revoked.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`,
        },
      });
    }

    return updated;
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      student: true,
      supervisor: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAdminRolesPermissions() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
  const permissions = [
    { key: 'applications:view', name: 'View Applications', description: 'View clinical attachment and placement applications' },
    { key: 'applications:edit', name: 'Edit Applications', description: 'Edit application details and state transitions' },
    { key: 'applications:approve', name: 'Approve Applications', description: 'Grant official clinical approval' },
    { key: 'placements:manage', name: 'Manage Placements', description: 'Create and assign clinical attachments' },
    { key: 'evaluations:submit', name: 'Submit Evaluations', description: 'Submit mid-term and final clinical reviews' },
    { key: 'certificates:issue', name: 'Issue Certificates', description: 'Generate and verify completion certificates' },
    { key: 'users:manage', name: 'Manage Users', description: 'Invite, assign roles, and deactivate system accounts' },
    { key: 'audit:view', name: 'View Audit Logs', description: 'Inspect security and operational audit trails' },
    { key: 'settings:manage', name: 'Manage System Settings', description: 'Configure academic cycle, portals, and policies' },
  ];
  return { roles, permissions };
}

export async function getAdminAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAdminSettings() {
  return prisma.systemSetting.findMany();
}

// The admin notification endpoints (mounted under requireRoles(['SUPER_ADMIN','AZAAM_STAFF']) in
// adminRoutes.ts) show a SUPER_ADMIN/AZAAM_STAFF user their own notifications, plus let them act
// on behalf of any user for support purposes. Per-user access for every other role (STUDENT,
// SUPERVISOR, UNIVERSITY_USER, ORGANIZATION_USER) is provided separately by notificationRoutes.ts
// / notificationService.ts, which is scoped strictly to req.authUser.id.
export async function getAdminNotifications(userId: string) {
  return listNotificationsForUser(userId);
}

export async function markNotificationRead(actorId: string, actorRoles: string[], id: string) {
  return markNotificationReadForUser(actorId, actorRoles, id);
}

export async function markAllNotificationsRead(userId: string) {
  return markAllNotificationsReadForUser(userId);
}

export async function globalAdminSearch(query: string) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return { students: [], applications: [], universities: [], organizations: [], placements: [] };

  const students = (
    await prisma.student.findMany({
      include: { user: true, university: true, organization: true },
    })
  ).filter((s: any) =>
    (s.fullName || '').toLowerCase().includes(q) ||
    (s.nationality || '').toLowerCase().includes(q) ||
    (s.user?.email || '').toLowerCase().includes(q)
  );

  const applications = (
    await prisma.application.findMany({
      include: { student: true, specialty: true, university: true, organization: true },
    })
  ).filter((a: any) =>
    (a.applicationNumber || '').toLowerCase().includes(q) ||
    (a.clinicalInterests || '').toLowerCase().includes(q) ||
    (a.student?.fullName || '').toLowerCase().includes(q)
  );

  const universities = (
    await prisma.university.findMany({
      include: { students: true, applications: true },
    })
  ).filter((u: any) =>
    (u.name || '').toLowerCase().includes(q)
  );

  const organizations = (
    await prisma.organization.findMany({
      include: { departments: true, supervisors: true },
    })
  ).filter((o: any) =>
    (o.name || '').toLowerCase().includes(q)
  );

  const placements = (
    await prisma.placement.findMany({
      include: { student: true, organization: true, department: true },
    })
  ).filter((p: any) =>
    (p.student?.fullName || '').toLowerCase().includes(q) ||
    (p.organization?.name || '').toLowerCase().includes(q)
  );

  return { students, applications, universities, organizations, placements };
}

