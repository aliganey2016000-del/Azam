import { prisma } from '../utils/prisma';
export async function getAdminSummary() {
  const [students, universities, organizations, pendingApplications, approvedApplications, activeApplications] = await Promise.all([
    prisma.student.count(),
    prisma.university.count(),
    prisma.organization.count(),
    prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED'] } } }),
    prisma.application.count({ where: { status: 'APPROVED' } }),
    prisma.application.count({ where: { status: { in: ['PLACED', 'SUPERVISOR_ASSIGNED', 'ACTIVE'] } } }),
  ]);
  return { students, universities, organizations, pendingApplications, approvedApplications, activeApplications };
}
