import { PrismaClient } from '@prisma/client';
import { StudentSource, UserStatus, ApplicationStatus } from '../types/auth';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

// In-memory database store for fallback when external PostgreSQL is not connected
class InMemoryDb {
  users: any[] = [];
  roles: any[] = [];
  permissions: any[] = [];
  rolePermissions: any[] = [];
  userRoles: any[] = [];
  students: any[] = [];
  universities: any[] = [];
  universityUsers: any[] = [];
  organizations: any[] = [];
  organizationUsers: any[] = [];
  departments: any[] = [];
  supervisors: any[] = [];
  programmes: any[] = [];
  specialties: any[] = [];
  countries: any[] = [];
  cities: any[] = [];
  applications: any[] = [];
  documents: any[] = [];
  applicationDocuments: any[] = [];
  applicationStatusHistories: any[] = [];
  placements: any[] = [];
  notifications: any[] = [];
  auditLogs: any[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('DemoPassword!2026', 10);

    const permissionKeys = [
      'students.view', 'students.create', 'students.update',
      'applications.view', 'applications.create', 'applications.review',
      'applications.approve', 'applications.reject', 'documents.view',
      'documents.create', 'organizations.view', 'organizations.create',
      'organizations.approve', 'placements.view', 'placements.create',
      'placements.update', 'certificates.view', 'certificates.issue',
      'certificates.revoke', 'reports.view', 'reports.export',
      'audit_logs.view', 'settings.manage'
    ];

    permissionKeys.forEach(key => {
      this.permissions.push({ id: randomUUID(), key });
    });

    const roleNames = ['SUPER_ADMIN', 'AZAAM_STAFF', 'UNIVERSITY_USER', 'ORGANIZATION_USER', 'SUPERVISOR', 'STUDENT'];
    roleNames.forEach(name => {
      this.roles.push({ id: randomUUID(), name });
    });

    const superAdminRole = this.roles.find(r => r.name === 'SUPER_ADMIN')!;
    const azaamStaffRole = this.roles.find(r => r.name === 'AZAAM_STAFF')!;
    const studentRole = this.roles.find(r => r.name === 'STUDENT')!;
    const universityRole = this.roles.find(r => r.name === 'UNIVERSITY_USER')!;
    const organizationRole = this.roles.find(r => r.name === 'ORGANIZATION_USER')!;
    const supervisorRole = this.roles.find(r => r.name === 'SUPERVISOR')!;

    this.permissions.forEach(p => {
      this.rolePermissions.push({ roleId: superAdminRole.id, permissionId: p.id });
      this.rolePermissions.push({ roleId: azaamStaffRole.id, permissionId: p.id });
    });

    ['students.view', 'students.update', 'applications.view', 'applications.create', 'documents.view', 'documents.create'].forEach(key => {
      const p = this.permissions.find(item => item.key === key);
      if (p) this.rolePermissions.push({ roleId: studentRole.id, permissionId: p.id });
    });

    const countryId = randomUUID();
    this.countries.push({ id: countryId, name: 'Demo Country' });

    const cityId = randomUUID();
    this.cities.push({ id: cityId, countryId, name: 'Demo City' });

    const programmeId = randomUUID();
    this.programmes.push({ id: programmeId, name: 'Demo MBBS' });

    const specialtyId = randomUUID();
    this.specialties.push({ id: specialtyId, name: 'Demo Internal Medicine' });

    const universityId = randomUUID();
    this.universities.push({ id: universityId, name: 'Demo University', status: 'APPROVED', createdAt: new Date(), updatedAt: new Date() });

    const organizationId = randomUUID();
    this.organizations.push({ id: organizationId, name: 'Demo Clinical Institution', status: 'APPROVED', createdAt: new Date(), updatedAt: new Date() });

    const departmentId = randomUUID();
    this.departments.push({ id: departmentId, organizationId, name: 'Demo Medicine Department' });

    // Seed users
    const adminUser = { id: randomUUID(), email: 'admin.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(adminUser);
    this.userRoles.push({ userId: adminUser.id, roleId: superAdminRole.id });

    const studentUser = { id: randomUUID(), email: 'student.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(studentUser);
    this.userRoles.push({ userId: studentUser.id, roleId: studentRole.id });
    const studentRecord = {
      id: randomUUID(),
      userId: studentUser.id,
      fullName: 'Demo Student',
      phone: '+1 555-0199',
      nationality: 'International',
      source: 'UNIVERSITY',
      universityId,
      organizationId: null,
      programmeId,
      countryId,
      profileCompleted: true,
    };
    this.students.push(studentRecord);

    const independentUser = { id: randomUUID(), email: 'independent.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(independentUser);
    this.userRoles.push({ userId: independentUser.id, roleId: studentRole.id });
    this.students.push({
      id: randomUUID(),
      userId: independentUser.id,
      fullName: 'Independent Demo Student',
      phone: '+1 555-0188',
      nationality: 'International',
      source: 'INDEPENDENT',
      universityId: null,
      organizationId: null,
      programmeId,
      countryId,
      profileCompleted: true,
    });

    const uniUser = { id: randomUUID(), email: 'university.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(uniUser);
    this.userRoles.push({ userId: uniUser.id, roleId: universityRole.id });
    this.universityUsers.push({ userId: uniUser.id, universityId });

    const orgUser = { id: randomUUID(), email: 'organization.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(orgUser);
    this.userRoles.push({ userId: orgUser.id, roleId: organizationRole.id });
    this.organizationUsers.push({ userId: orgUser.id, organizationId });

    const supUser = { id: randomUUID(), email: 'supervisor.demo@azam.test', passwordHash, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
    this.users.push(supUser);
    this.userRoles.push({ userId: supUser.id, roleId: supervisorRole.id });
    this.supervisors.push({ id: randomUUID(), userId: supUser.id, organizationId });

    // Seed a demo application for the student
    const sampleApp = {
      id: randomUUID(),
      applicationNumber: 'AZM-2026-DEMO01',
      studentId: studentRecord.id,
      universityId,
      organizationId: null,
      programmeId,
      specialtyId,
      preferredCountryId: countryId,
      preferredCityId: cityId,
      preferredStartDate: new Date(Date.now() + 14 * 86400000),
      preferredEndDate: new Date(Date.now() + 60 * 86400000),
      clinicalInterests: 'Cardiology and Internal Medicine clinical observation.',
      preferredInstitutionId: organizationId,
      noPreferredInstitution: false,
      source: 'UNIVERSITY',
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.push(sampleApp);
  }

  getUserWithRoles(user: any) {
    if (!user) return null;
    const userRoleLinks = this.userRoles.filter(ur => ur.userId === user.id);
    const roles = userRoleLinks.map(ur => {
      const role = this.roles.find(r => r.id === ur.roleId);
      const permLinks = this.rolePermissions.filter(rp => rp.roleId === role?.id);
      const permissions = permLinks.map(pl => {
        const perm = this.permissions.find(p => p.id === pl.permissionId);
        return { permission: perm };
      });
      return {
        role: {
          ...role,
          permissions,
        }
      };
    });
    return { ...user, roles };
  }

  getStudentWithRelations(student: any) {
    if (!student) return null;
    return {
      ...student,
      university: this.universities.find(u => u.id === student.universityId) || null,
      organization: this.organizations.find(o => o.id === student.organizationId) || null,
      programme: this.programmes.find(p => p.id === student.programmeId) || null,
      country: this.countries.find(c => c.id === student.countryId) || null,
    };
  }

  getApplicationWithRelations(app: any) {
    if (!app) return null;
    const student = this.students.find(s => s.id === app.studentId);
    const appDocLinks = this.applicationDocuments.filter(ad => ad.applicationId === app.id);
    const documents = appDocLinks.map(ad => ({
      ...ad,
      document: this.documents.find(d => d.id === ad.documentId) || null,
    }));
    const history = this.applicationStatusHistories.filter(h => h.applicationId === app.id);
    return {
      ...app,
      student: student ? this.getStudentWithRelations(student) : null,
      documents,
      history,
      programme: this.programmes.find(p => p.id === app.programmeId) || null,
      specialty: this.specialties.find(s => s.id === app.specialtyId) || null,
      university: this.universities.find(u => u.id === app.universityId) || null,
      organization: this.organizations.find(o => o.id === app.organizationId) || null,
      preferredCountry: this.countries.find(c => c.id === app.preferredCountryId) || null,
      preferredCity: this.cities.find(c => c.id === app.preferredCityId) || null,
    };
  }
}

const memory = new InMemoryDb();

function matchesFilter(item: any, where: any): boolean {
  if (!where || Object.keys(where).length === 0) return true;
  for (const key of Object.keys(where)) {
    const condition = where[key];
    if (condition === undefined) continue;
    if (key === 'student' && condition && condition.userId) {
      const student = memory.students.find(s => s.id === item.studentId);
      if (!student || student.userId !== condition.userId) return false;
      continue;
    }
    if (typeof condition === 'object' && condition !== null) {
      if ('in' in condition && Array.isArray(condition.in)) {
        if (!condition.in.includes(item[key])) return false;
      } else if ('equals' in condition) {
        if (item[key] !== condition.equals) return false;
      }
    } else {
      if (item[key] !== condition) return false;
    }
  }
  return true;
}

export const inMemoryPrisma: any = {
  $queryRaw: async () => [{ '?column?': 1 }],
  $disconnect: async () => {},
  $transaction: async (fn: (tx: any) => Promise<any>) => {
    return fn(inMemoryPrisma);
  },

  user: {
    findUnique: async ({ where }: any) => {
      const user = memory.users.find(u => (where.id && u.id === where.id) || (where.email && u.email === where.email));
      return user ? memory.getUserWithRoles(user) : null;
    },
    findFirst: async ({ where }: any) => {
      const user = memory.users.find(u => matchesFilter(u, where));
      return user ? memory.getUserWithRoles(user) : null;
    },
    findMany: async () => memory.users.map(u => memory.getUserWithRoles(u)),
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      const user = {
        id,
        email: data.email,
        passwordHash: data.passwordHash,
        status: data.status || 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memory.users.push(user);

      if (data.roles?.create) {
        const roleId = data.roles.create.roleId;
        memory.userRoles.push({ userId: id, roleId });
      }

      if (data.student?.create) {
        const student = {
          id: randomUUID(),
          userId: id,
          fullName: data.student.create.fullName || 'New Student',
          phone: data.student.create.phone || null,
          nationality: data.student.create.nationality || null,
          source: data.student.create.source || 'INDEPENDENT',
          universityId: null,
          organizationId: null,
          programmeId: null,
          countryId: null,
          profileCompleted: false,
        };
        memory.students.push(student);
      }

      return memory.getUserWithRoles(user);
    },
    update: async ({ where, data }: any) => {
      const idx = memory.users.findIndex(u => u.id === where.id || u.email === where.email);
      if (idx === -1) return null;
      memory.users[idx] = { ...memory.users[idx], ...data, updatedAt: new Date() };
      return memory.getUserWithRoles(memory.users[idx]);
    },
    upsert: async ({ where, update, create }: any) => {
      const existing = memory.users.find(u => (where.id && u.id === where.id) || (where.email && u.email === where.email));
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return memory.getUserWithRoles(existing);
      }
      return inMemoryPrisma.user.create({ data: create });
    },
    count: async () => memory.users.length,
  },

  role: {
    findUnique: async ({ where }: any) => {
      return memory.roles.find(r => (where.id && r.id === where.id) || (where.name && r.name === where.name)) || null;
    },
    findMany: async () => memory.roles,
    upsert: async ({ where, update, create }: any) => {
      const existing = memory.roles.find(r => r.name === where.name);
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      const role = { id: randomUUID(), ...create };
      memory.roles.push(role);
      return role;
    },
  },

  permission: {
    findUnique: async ({ where }: any) => memory.permissions.find(p => p.key === where.key) || null,
    upsert: async ({ where, update, create }: any) => {
      const existing = memory.permissions.find(p => p.key === where.key);
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      const perm = { id: randomUUID(), ...create };
      memory.permissions.push(perm);
      return perm;
    },
  },

  rolePermission: {
    createMany: async ({ data }: any) => {
      data.forEach((item: any) => {
        if (!memory.rolePermissions.some(rp => rp.roleId === item.roleId && rp.permissionId === item.permissionId)) {
          memory.rolePermissions.push(item);
        }
      });
      return { count: data.length };
    },
  },

  userRole: {
    upsert: async ({ where, create }: any) => {
      const key = where.userId_roleId;
      const existing = memory.userRoles.find(ur => ur.userId === key.userId && ur.roleId === key.roleId);
      if (existing) return existing;
      memory.userRoles.push(create);
      return create;
    },
  },

  student: {
    findUnique: async ({ where }: any) => {
      const student = memory.students.find(s => (where.id && s.id === where.id) || (where.userId && s.userId === where.userId));
      return student ? memory.getStudentWithRelations(student) : null;
    },
    findFirst: async ({ where }: any) => {
      const student = memory.students.find(s => matchesFilter(s, where));
      return student ? memory.getStudentWithRelations(student) : null;
    },
    findMany: async ({ where }: any = {}) => {
      return memory.students.filter(s => matchesFilter(s, where)).map(s => memory.getStudentWithRelations(s));
    },
    create: async ({ data }: any) => {
      const student = { id: data.id || randomUUID(), ...data, profileCompleted: data.profileCompleted ?? false };
      memory.students.push(student);
      return memory.getStudentWithRelations(student);
    },
    update: async ({ where, data }: any) => {
      const idx = memory.students.findIndex(s => (where.id && s.id === where.id) || (where.userId && s.userId === where.userId));
      if (idx === -1) return null;
      memory.students[idx] = { ...memory.students[idx], ...data };
      return memory.getStudentWithRelations(memory.students[idx]);
    },
    upsert: async ({ where, update, create }: any) => {
      const existing = memory.students.find(s => (where.id && s.id === where.id) || (where.userId && s.userId === where.userId));
      if (existing) {
        Object.assign(existing, update);
        return memory.getStudentWithRelations(existing);
      }
      return inMemoryPrisma.student.create({ data: create });
    },
    count: async () => memory.students.length,
  },

  university: {
    findUnique: async ({ where }: any) => memory.universities.find(u => u.id === where.id || u.name === where.name) || null,
    findFirst: async ({ where }: any) => memory.universities.find(u => matchesFilter(u, where)) || null,
    findMany: async () => memory.universities,
    create: async ({ data }: any) => {
      const u = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data };
      memory.universities.push(u);
      return u;
    },
    update: async ({ where, data }: any) => {
      const u = memory.universities.find(item => item.id === where.id);
      if (u) Object.assign(u, data, { updatedAt: new Date() });
      return u;
    },
    upsert: async ({ where, update, create }: any) => {
      const u = memory.universities.find(item => item.name === where.name);
      if (u) { Object.assign(u, update); return u; }
      return inMemoryPrisma.university.create({ data: create });
    },
    count: async () => memory.universities.length,
  },

  universityUser: {
    upsert: async ({ where, update, create }: any) => {
      const u = memory.universityUsers.find(item => item.userId === where.userId);
      if (u) { Object.assign(u, update); return u; }
      memory.universityUsers.push(create);
      return create;
    },
  },

  organization: {
    findUnique: async ({ where }: any) => memory.organizations.find(o => o.id === where.id || o.name === where.name) || null,
    findFirst: async ({ where }: any) => memory.organizations.find(o => matchesFilter(o, where)) || null,
    findMany: async () => memory.organizations,
    create: async ({ data }: any) => {
      const o = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data };
      memory.organizations.push(o);
      return o;
    },
    update: async ({ where, data }: any) => {
      const o = memory.organizations.find(item => item.id === where.id);
      if (o) Object.assign(o, data, { updatedAt: new Date() });
      return o;
    },
    upsert: async ({ where, update, create }: any) => {
      const o = memory.organizations.find(item => item.name === where.name);
      if (o) { Object.assign(o, update); return o; }
      return inMemoryPrisma.organization.create({ data: create });
    },
    count: async () => memory.organizations.length,
  },

  organizationUser: {
    upsert: async ({ where, update, create }: any) => {
      const o = memory.organizationUsers.find(item => item.userId === where.userId);
      if (o) { Object.assign(o, update); return o; }
      memory.organizationUsers.push(create);
      return create;
    },
  },

  supervisor: {
    upsert: async ({ where, update, create }: any) => {
      const s = memory.supervisors.find(item => item.userId === where.userId);
      if (s) { Object.assign(s, update); return s; }
      const newS = { id: randomUUID(), ...create };
      memory.supervisors.push(newS);
      return newS;
    },
  },

  department: {
    upsert: async ({ where, update, create }: any) => {
      const d = memory.departments.find(item => item.organizationId === where.organizationId_name?.organizationId && item.name === where.organizationId_name?.name);
      if (d) { Object.assign(d, update); return d; }
      const newD = { id: randomUUID(), ...create };
      memory.departments.push(newD);
      return newD;
    },
  },

  programme: {
    findUnique: async ({ where }: any) => memory.programmes.find(p => p.id === where.id || p.name === where.name) || null,
    findFirst: async ({ where }: any) => memory.programmes.find(p => matchesFilter(p, where)) || null,
    findMany: async () => memory.programmes,
    create: async ({ data }: any) => {
      const p = { id: randomUUID(), ...data };
      memory.programmes.push(p);
      return p;
    },
  },

  specialty: {
    findUnique: async ({ where }: any) => memory.specialties.find(s => s.id === where.id || s.name === where.name) || null,
    findFirst: async ({ where }: any) => memory.specialties.find(s => matchesFilter(s, where)) || null,
    findMany: async () => memory.specialties,
    create: async ({ data }: any) => {
      const s = { id: randomUUID(), ...data };
      memory.specialties.push(s);
      return s;
    },
  },

  country: {
    findUnique: async ({ where }: any) => memory.countries.find(c => c.id === where.id || c.name === where.name) || null,
    upsert: async ({ where, update, create }: any) => {
      const c = memory.countries.find(item => item.name === where.name);
      if (c) { Object.assign(c, update); return c; }
      const newC = { id: randomUUID(), ...create };
      memory.countries.push(newC);
      return newC;
    },
  },

  city: {
    upsert: async ({ where, update, create }: any) => {
      const c = memory.cities.find(item => item.countryId === where.countryId_name?.countryId && item.name === where.countryId_name?.name);
      if (c) { Object.assign(c, update); return c; }
      const newC = { id: randomUUID(), ...create };
      memory.cities.push(newC);
      return newC;
    },
  },

  application: {
    findUnique: async ({ where }: any) => {
      const app = memory.applications.find(a => (where.id && a.id === where.id) || (where.applicationNumber && a.applicationNumber === where.applicationNumber));
      return app ? memory.getApplicationWithRelations(app) : null;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      let list = memory.applications.filter(a => matchesFilter(a, where)).map(a => memory.getApplicationWithRelations(a));
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list;
    },
    create: async ({ data }: any) => {
      const app = {
        id: randomUUID(),
        ...data,
        status: data.status || 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memory.applications.push(app);
      return memory.getApplicationWithRelations(app);
    },
    update: async ({ where, data }: any) => {
      const idx = memory.applications.findIndex(a => a.id === where.id);
      if (idx === -1) return null;
      memory.applications[idx] = { ...memory.applications[idx], ...data, updatedAt: new Date() };
      return memory.getApplicationWithRelations(memory.applications[idx]);
    },
    count: async ({ where }: any = {}) => {
      return memory.applications.filter(a => matchesFilter(a, where)).length;
    },
  },

  applicationDocument: {
    create: async ({ data }: any) => {
      memory.applicationDocuments.push(data);
      return data;
    },
    findMany: async ({ where }: any = {}) => {
      return memory.applicationDocuments.filter(ad => matchesFilter(ad, where));
    },
  },

  applicationStatusHistory: {
    create: async ({ data }: any) => {
      const record = { id: randomUUID(), createdAt: new Date(), ...data };
      memory.applicationStatusHistories.push(record);
      return record;
    },
    findMany: async ({ where }: any = {}) => {
      return memory.applicationStatusHistories.filter(h => matchesFilter(h, where));
    },
  },

  document: {
    findUnique: async ({ where }: any) => memory.documents.find(d => d.id === where.id) || null,
    findMany: async ({ where }: any = {}) => {
      return memory.documents.filter(d => matchesFilter(d, where));
    },
    create: async ({ data }: any) => {
      const { applications, ...docData } = data;
      const doc = {
        id: randomUUID(),
        createdAt: new Date(),
        status: 'PENDING',
        ...docData,
      };
      memory.documents.push(doc);
      if (applications?.create?.applicationId) {
        memory.applicationDocuments.push({
          applicationId: applications.create.applicationId,
          documentId: doc.id,
        });
      }
      return doc;
    },
  },

  notification: {
    create: async ({ data }: any) => {
      const notif = { id: randomUUID(), createdAt: new Date(), read: false, ...data };
      memory.notifications.push(notif);
      return notif;
    },
  },

  auditLog: {
    create: async ({ data }: any) => {
      const log = { id: randomUUID(), createdAt: new Date(), ...data };
      memory.auditLogs.push(log);
      return log;
    },
  },
};

let prismaInstance: any;

try {
  // If a valid PostgreSQL connection string is configured and not the mock default
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock:mock')) {
    prismaInstance = new PrismaClient();
  } else {
    prismaInstance = inMemoryPrisma;
  }
} catch (e) {
  console.warn('[AI Studio] PostgreSQL not connected — using robust in-memory database mock', e);
  prismaInstance = inMemoryPrisma;
}

export const prisma = prismaInstance;
export default prisma;
