import { PrismaClient, StudentSource, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissions = ['students.view','students.create','students.update','applications.view','applications.create','applications.review','applications.approve','applications.reject','documents.view','documents.create','organizations.view','organizations.create','organizations.approve','placements.view','placements.create','placements.update','certificates.view','certificates.issue','certificates.revoke','reports.view','reports.export','audit_logs.view','settings.manage'];
const roles = ['SUPER_ADMIN','AZAAM_STAFF','UNIVERSITY_USER','ORGANIZATION_USER','SUPERVISOR','STUDENT'];

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin.demo@azam.test';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'DemoPassword!2026';

if (adminPassword.length < 12) {
  throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters long');
}

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const permissionRows = await Promise.all(
    permissions.map((key) => prisma.permission.upsert({ where: { key }, update: {}, create: { key } })),
  );
  const roleRows = await Promise.all(
    roles.map((name) => prisma.role.upsert({ where: { name }, update: {}, create: { name } })),
  );

  const role = (name: string) => roleRows.find((row) => row.name === name)!;
  const permission = (key: string) => permissionRows.find((row) => row.key === key)!;

  await prisma.rolePermission.createMany({
    data: permissionRows.map((item) => ({ roleId: role('SUPER_ADMIN').id, permissionId: item.id })),
    skipDuplicates: true,
  });
  await prisma.rolePermission.createMany({
    data: permissionRows.map((item) => ({ roleId: role('AZAAM_STAFF').id, permissionId: item.id })),
    skipDuplicates: true,
  });

  const studentPermissionKeys = ['students.view', 'students.update', 'applications.view', 'applications.create', 'documents.view', 'documents.create'];
  await prisma.rolePermission.createMany({
    data: studentPermissionKeys.map((key) => ({ roleId: role('STUDENT').id, permissionId: permission(key).id })),
    skipDuplicates: true,
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: { email: adminEmail, passwordHash, status: UserStatus.ACTIVE },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: role('SUPER_ADMIN').id } },
    update: {},
    create: { userId: admin.id, roleId: role('SUPER_ADMIN').id },
  });

  const country = await prisma.country.upsert({
    where: { name: 'Demo Country' },
    update: {},
    create: { name: 'Demo Country' },
  });
  const city = await prisma.city.upsert({
    where: { countryId_name: { countryId: country.id, name: 'Demo City' } },
    update: {},
    create: { countryId: country.id, name: 'Demo City' },
  });
  const programme = await prisma.programme.upsert({
    where: { name: 'Demo MBBS' },
    update: {},
    create: { name: 'Demo MBBS' },
  });
  const specialty = await prisma.specialty.upsert({
    where: { name: 'Demo Internal Medicine' },
    update: {},
    create: { name: 'Demo Internal Medicine' },
  });
  const university = await prisma.university.upsert({
    where: { name: 'Demo University' },
    update: { status: 'APPROVED' },
    create: { name: 'Demo University', status: 'APPROVED' },
  });
  const organization = await prisma.organization.upsert({
    where: { name: 'Demo Clinical Institution' },
    update: { status: 'APPROVED' },
    create: { name: 'Demo Clinical Institution', status: 'APPROVED' },
  });
  const department = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: 'Demo Medicine Department' } },
    update: {},
    create: { organizationId: organization.id, name: 'Demo Medicine Department' },
  });

  async function user(email: string, roleId: string) {
    const record = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: { email, passwordHash, status: UserStatus.ACTIVE },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: record.id, roleId } },
      update: {},
      create: { userId: record.id, roleId },
    });
    return record;
  }

  const universityUser = await user('university.demo@azam.test', role('UNIVERSITY_USER').id);
  await prisma.universityUser.upsert({
    where: { userId: universityUser.id },
    update: { universityId: university.id },
    create: { userId: universityUser.id, universityId: university.id },
  });

  const organizationUser = await user('organization.demo@azam.test', role('ORGANIZATION_USER').id);
  await prisma.organizationUser.upsert({
    where: { userId: organizationUser.id },
    update: { organizationId: organization.id },
    create: { userId: organizationUser.id, organizationId: organization.id },
  });

  const supervisorUser = await user('supervisor.demo@azam.test', role('SUPERVISOR').id);
  await prisma.supervisor.upsert({
    where: { userId: supervisorUser.id },
    update: { organizationId: organization.id },
    create: { userId: supervisorUser.id, organizationId: organization.id },
  });

  const studentUser = await user('student.demo@azam.test', role('STUDENT').id);
  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      fullName: 'Demo Student',
      source: StudentSource.UNIVERSITY,
      universityId: university.id,
      organizationId: null,
      programmeId: programme.id,
      countryId: country.id,
    },
    create: {
      userId: studentUser.id,
      fullName: 'Demo Student',
      source: StudentSource.UNIVERSITY,
      universityId: university.id,
      programmeId: programme.id,
      countryId: country.id,
    },
  });

  const independentUser = await user('independent.demo@azam.test', role('STUDENT').id);
  await prisma.student.upsert({
    where: { userId: independentUser.id },
    update: {
      fullName: 'Independent Demo Student',
      source: StudentSource.INDEPENDENT,
      universityId: null,
      organizationId: null,
      programmeId: programme.id,
      countryId: country.id,
    },
    create: {
      userId: independentUser.id,
      fullName: 'Independent Demo Student',
      source: StudentSource.INDEPENDENT,
      programmeId: programme.id,
      countryId: country.id,
    },
  });

  console.log(`Seeded admin: ${adminEmail}`);
  console.log(`Seeded demo data for ${city.name}, ${specialty.name}, ${department.name}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
