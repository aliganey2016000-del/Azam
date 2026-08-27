import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/utils/prisma';

// Shared fixtures. globalSetup.ts runs prisma/seed.ts before the suite starts, so roles,
// permissions, and a 'Demo University' / 'Demo Clinical Institution' / 'Demo Medicine Department'
// already exist. Tests create their own uniquely-named users/students/applications on top of
// that shared seed data (random UUID-based emails/numbers) so tests never collide with each
// other, even if vitest runs test files concurrently.

export async function getRoleId(name: string): Promise<string> {
  const role = await prisma.role.findUniqueOrThrow({ where: { name } });
  return role.id;
}

export async function createUser(roleName: string, overrides: { email?: string; status?: string } = {}) {
  const roleId = await getRoleId(roleName);
  const email = overrides.email ?? `test-${randomUUID()}@azam.test`;
  return prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash('TestPassword!2026', 4),
      status: overrides.status ?? 'ACTIVE',
      roles: { create: { roleId } },
    },
  });
}

export async function createStudent(overrides: {
  universityId?: string | null;
  organizationId?: string | null;
  source?: 'UNIVERSITY' | 'ORGANIZATION' | 'INDEPENDENT';
  fullName?: string;
} = {}) {
  const user = await createUser('STUDENT');
  const student = await prisma.student.create({
    data: {
      userId: user.id,
      fullName: overrides.fullName ?? 'Test Student',
      source: overrides.source ?? 'INDEPENDENT',
      universityId: overrides.universityId ?? null,
      organizationId: overrides.organizationId ?? null,
    },
  });
  return { user, student };
}

export async function getDemoUniversity() {
  return prisma.university.findFirstOrThrow({ where: { name: 'Demo University' } });
}

export async function getDemoOrganization() {
  return prisma.organization.findFirstOrThrow({ where: { name: 'Demo Clinical Institution' } });
}

export async function getDemoDepartment() {
  return prisma.department.findFirstOrThrow({ where: { name: 'Demo Medicine Department' } });
}

export async function createApplicationForStudent(
  studentId: string,
  overrides: { status?: string; source?: string } = {},
) {
  return prisma.application.create({
    data: {
      applicationNumber: `AZM-TEST-${randomUUID().slice(0, 8).toUpperCase()}`,
      studentId,
      source: (overrides.source as any) ?? 'INDEPENDENT',
      status: (overrides.status as any) ?? 'UNDER_REVIEW',
    },
  });
}

/** Builds a placement + IN_PROGRESS clinical attachment directly (bypassing createPlacement's
 * business rules) so certificate/evaluation tests can set up fixtures quickly. */
export async function createPlacementWithAttachment(applicationId: string, studentId: string) {
  const organization = await getDemoOrganization();
  const department = await getDemoDepartment();

  const placement = await prisma.placement.create({
    data: {
      applicationId,
      studentId,
      organizationId: organization.id,
      departmentId: department.id,
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(Date.now() + 30 * 86400000),
      status: 'ACTIVE',
    },
  });

  const attachment = await prisma.clinicalAttachment.create({
    data: { placementId: placement.id, status: 'IN_PROGRESS' },
  });

  return { placement, attachment };
}

export function pdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.4\n1 0 obj\n<< >>\nendobj\n%%EOF\n');
}

export function fakeMulterFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  const buffer = overrides.buffer ?? pdfBuffer();
  return {
    fieldname: 'file',
    originalname: overrides.originalname ?? 'passport.pdf',
    encoding: '7bit',
    mimetype: overrides.mimetype ?? 'application/pdf',
    size: buffer.length,
    buffer,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as any,
  } as Express.Multer.File;
}
