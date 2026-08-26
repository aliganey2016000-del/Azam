import { PrismaClient, StudentSource, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const permissions = ['students.view','students.create','students.update','applications.view','applications.create','applications.review','applications.approve','applications.reject','organizations.view','organizations.create','organizations.approve','placements.view','placements.create','placements.update','certificates.view','certificates.issue','certificates.revoke','reports.view','reports.export','audit_logs.view','settings.manage'];
const roles = ['SUPER_ADMIN','AZAAM_STAFF','UNIVERSITY_USER','ORGANIZATION_USER','SUPERVISOR','STUDENT'];
async function main() {
  const passwordHash = await bcrypt.hash('DemoPassword!2026', 12);
  const permissionRows = await Promise.all(permissions.map((key) => prisma.permission.upsert({ where: { key }, update: {}, create: { key } })));
  const roleRows = await Promise.all(roles.map((name) => prisma.role.upsert({ where: { name }, update: {}, create: { name } })));
  const superRole = roleRows.find((role) => role.name === 'SUPER_ADMIN')!;
  await prisma.rolePermission.createMany({ data: permissionRows.map((permission) => ({ roleId: superRole.id, permissionId: permission.id })), skipDuplicates: true });
  const staffRole = roleRows.find((role) => role.name === 'AZAAM_STAFF')!;
  await prisma.rolePermission.createMany({ data: permissionRows.map((permission) => ({ roleId: staffRole.id, permissionId: permission.id })), skipDuplicates: true });
  const country = await prisma.country.upsert({ where: { name: 'Demo Country' }, update: {}, create: { name: 'Demo Country' } });
  const city = await prisma.city.upsert({ where: { countryId_name: { countryId: country.id, name: 'Demo City' } }, update: {}, create: { countryId: country.id, name: 'Demo City' } });
  const programme = await prisma.programme.create({ data: { name: `Demo MBBS ${Date.now()}` } });
  const specialty = await prisma.specialty.create({ data: { name: `Demo Internal Medicine ${Date.now()}` } });
  const university = await prisma.university.create({ data: { name: 'Demo University', status: 'APPROVED' } });
  const organization = await prisma.organization.create({ data: { name: 'Demo Clinical Institution', status: 'APPROVED' } });
  const department = await prisma.department.create({ data: { organizationId: organization.id, name: 'Demo Medicine Department' } });
  async function user(email: string, roleId: string) { const record = await prisma.user.create({ data: { email, passwordHash, status: UserStatus.ACTIVE, roles: { create: { roleId } } } }); return record; }
  await user('admin.demo@azam.test', superRole.id);
  await user('staff.demo@azam.test', staffRole.id);
  const universityUser = await user('university.demo@azam.test', roleRows.find((r) => r.name === 'UNIVERSITY_USER')!.id);
  await prisma.universityUser.create({ data: { userId: universityUser.id, universityId: university.id } });
  const organizationUser = await user('organization.demo@azam.test', roleRows.find((r) => r.name === 'ORGANIZATION_USER')!.id);
  await prisma.organizationUser.create({ data: { userId: organizationUser.id, organizationId: organization.id } });
  const supervisorUser = await user('supervisor.demo@azam.test', roleRows.find((r) => r.name === 'SUPERVISOR')!.id);
  await prisma.supervisor.create({ data: { userId: supervisorUser.id, organizationId: organization.id } });
  const studentUser = await user('student.demo@azam.test', roleRows.find((r) => r.name === 'STUDENT')!.id);
  await prisma.student.create({ data: { userId: studentUser.id, fullName: 'Demo Student', source: StudentSource.UNIVERSITY, universityId: university.id, programmeId: programme.id, countryId: country.id } });
  const independentUser = await user('independent.demo@azam.test', roleRows.find((r) => r.name === 'STUDENT')!.id);
  await prisma.student.create({ data: { userId: independentUser.id, fullName: 'Independent Demo Student', source: StudentSource.INDEPENDENT, programmeId: programme.id, countryId: country.id } });
  console.log(`Seeded demo data for ${city.name}, ${department.name}. Password: DemoPassword!2026`);
}
main().finally(() => prisma.$disconnect());
