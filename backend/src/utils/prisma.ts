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
  attendance: any[] = [];
  logbookEntries: any[] = [];
  evaluations: any[] = [];
  certificates: any[] = [];
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
    this.supervisors.push({ id: randomUUID(), userId: supUser.id, organizationId, name: 'Dr. Sarah Al-Mansoor', specialty: 'Internal Medicine', department: 'Demo Medicine Department' });

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

    // Seed a placement and clinical attachment
    const placementId = randomUUID();
    const attachmentId = randomUUID();
    const supervisorId = this.supervisors[0].id;
    this.placements.push({
      id: placementId,
      applicationId: sampleApp.id,
      studentId: studentRecord.id,
      organizationId,
      departmentId,
      specialtyId,
      supervisorId,
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() + 50 * 86400000),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed attendance records
    for (let i = 1; i <= 5; i++) {
      this.attendance.push({
        id: randomUUID(),
        attachmentId,
        placementId,
        studentId: studentRecord.id,
        date: new Date(Date.now() - i * 86400000),
        status: i === 4 ? 'LATE' : 'PRESENT',
        checkIn: new Date(Date.now() - i * 86400000 + 8 * 3600000),
        checkOut: new Date(Date.now() - i * 86400000 + 16 * 3600000),
        comment: i === 4 ? 'Arrived 15 mins late due to hospital orientation briefing' : 'Completed ward rounds on time',
      });
    }

    // Seed logbook entries
    this.logbookEntries.push({
      id: randomUUID(),
      attachmentId,
      placementId,
      studentId: studentRecord.id,
      date: new Date(Date.now() - 2 * 86400000),
      clinicalArea: 'Internal Medicine Ward',
      content: { procedure: 'ECG interpretation & Patient admission review', casesCount: 4, reflection: 'Observed differential diagnosis for acute chest discomfort.' },
      status: 'VERIFIED',
      supervisorComment: 'Solid diagnostic acumen and thorough clinical note-taking.',
    });
    this.logbookEntries.push({
      id: randomUUID(),
      attachmentId,
      placementId,
      studentId: studentRecord.id,
      date: new Date(Date.now() - 1 * 86400000),
      clinicalArea: 'Outpatient Cardiology Clinic',
      content: { procedure: 'Echocardiogram observation and history taking', casesCount: 6, reflection: 'Gained familiarity with valvular regurgitation murmurs.' },
      status: 'SUBMITTED',
      supervisorComment: null,
    });

    // Seed evaluations
    this.evaluations.push({
      id: randomUUID(),
      attachmentId,
      placementId,
      studentId: studentRecord.id,
      type: 'MID_TERM',
      status: 'COMPLETED',
      submittedById: supUser.id,
      score: 88.5,
      maximum: 100,
      submittedDate: new Date(Date.now() - 3 * 86400000),
      feedback: 'Excellent attendance, respectful patient communication, and strong core medical knowledge.',
    });

    // Seed certificates
    this.certificates.push({
      id: randomUUID(),
      certificateNumber: 'AZM-CERT-2026-0042',
      attachmentId,
      studentId: studentRecord.id,
      status: 'VALID',
      issueDate: new Date(Date.now() - 1 * 86400000),
      recipientName: 'Demo Student',
      programmeName: 'Demo MBBS',
      specialtyName: 'Demo Internal Medicine',
      institutionName: 'Demo Clinical Institution',
    });

    // Seed notifications
    this.notifications.push({
      id: randomUUID(),
      recipientId: adminUser.id,
      title: 'New Clinical Application Received',
      message: 'Student Demo Student submitted application AZM-2026-DEMO01 for review.',
      type: 'APPLICATION_SUBMITTED',
      read: false,
      createdAt: new Date(Date.now() - 30 * 60000),
    });
    this.notifications.push({
      id: randomUUID(),
      recipientId: adminUser.id,
      title: 'Logbook Submission Pending Review',
      message: 'Dr. Sarah Al-Mansoor reviewed 2 logbook entries for Internal Medicine.',
      type: 'LOGBOOK_REVIEW',
      read: true,
      createdAt: new Date(Date.now() - 2 * 3600000),
    });
    this.notifications.push({
      id: randomUUID(),
      recipientId: adminUser.id,
      title: 'University Agreement Verification',
      message: 'Demo University updated coordinator contact information.',
      type: 'INSTITUTION_UPDATE',
      read: true,
      createdAt: new Date(Date.now() - 24 * 3600000),
    });

    // Seed audit logs
    this.auditLogs.push({
      id: randomUUID(),
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'APPLICATION_REVIEW',
      entity: 'Application',
      entityId: sampleApp.id,
      details: 'Admin opened application AZM-2026-DEMO01 for verification.',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (AZAAM Staff Admin Shell)',
      createdAt: new Date(Date.now() - 15 * 60000),
    });
    this.auditLogs.push({
      id: randomUUID(),
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'SYSTEM_SETTINGS_UPDATE',
      entity: 'SystemSetting',
      entityId: 'general_portal_config',
      details: 'Audit logging policy and notification dispatch parameters verified.',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (AZAAM Staff Admin Shell)',
      createdAt: new Date(Date.now() - 2 * 86400000),
    });
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
    findMany: async () => memory.supervisors.map(s => ({
      ...s,
      organization: memory.organizations.find(o => o.id === s.organizationId) || null,
      user: memory.users.find(u => u.id === s.userId) || null,
    })),
    findUnique: async ({ where }: any) => {
      const s = memory.supervisors.find(item => item.id === where.id || item.userId === where.userId);
      if (!s) return null;
      return {
        ...s,
        organization: memory.organizations.find(o => o.id === s.organizationId) || null,
        user: memory.users.find(u => u.id === s.userId) || null,
      };
    },
    upsert: async ({ where, update, create }: any) => {
      const s = memory.supervisors.find(item => item.userId === where.userId);
      if (s) { Object.assign(s, update); return s; }
      const newS = { id: randomUUID(), ...create };
      memory.supervisors.push(newS);
      return newS;
    },
    count: async () => memory.supervisors.length,
  },

  placement: {
    findMany: async ({ where }: any = {}) => {
      return memory.placements.filter(p => matchesFilter(p, where)).map(p => ({
        ...p,
        student: memory.getStudentWithRelations(memory.students.find(s => s.id === p.studentId)),
        organization: memory.organizations.find(o => o.id === p.organizationId) || null,
        department: memory.departments.find(d => d.id === p.departmentId) || null,
        specialty: memory.specialties.find(s => s.id === p.specialtyId) || null,
        supervisor: memory.supervisors.find(s => s.id === p.supervisorId) || null,
        application: memory.applications.find(a => a.id === p.applicationId) || null,
      }));
    },
    findUnique: async ({ where }: any) => {
      const p = memory.placements.find(item => item.id === where.id || item.applicationId === where.applicationId);
      if (!p) return null;
      return {
        ...p,
        student: memory.getStudentWithRelations(memory.students.find(s => s.id === p.studentId)),
        organization: memory.organizations.find(o => o.id === p.organizationId) || null,
        department: memory.departments.find(d => d.id === p.departmentId) || null,
        specialty: memory.specialties.find(s => s.id === p.specialtyId) || null,
        supervisor: memory.supervisors.find(s => s.id === p.supervisorId) || null,
        application: memory.applications.find(a => a.id === p.applicationId) || null,
      };
    },
    create: async ({ data }: any) => {
      const p = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data };
      memory.placements.push(p);
      return p;
    },
    count: async ({ where }: any = {}) => memory.placements.filter(p => matchesFilter(p, where)).length,
  },

  attendance: {
    findMany: async ({ where }: any = {}) => {
      return memory.attendance.filter(a => matchesFilter(a, where)).map(a => ({
        ...a,
        student: memory.students.find(s => s.id === a.studentId) || null,
      }));
    },
    create: async ({ data }: any) => {
      const a = { id: randomUUID(), ...data };
      memory.attendance.push(a);
      return a;
    },
  },

  logbookEntry: {
    findMany: async ({ where }: any = {}) => {
      return memory.logbookEntries.filter(l => matchesFilter(l, where)).map(l => ({
        ...l,
        student: memory.students.find(s => s.id === l.studentId) || null,
      }));
    },
    create: async ({ data }: any) => {
      const l = { id: randomUUID(), ...data };
      memory.logbookEntries.push(l);
      return l;
    },
  },

  evaluation: {
    findMany: async ({ where }: any = {}) => {
      return memory.evaluations.filter(e => matchesFilter(e, where)).map(e => ({
        ...e,
        student: memory.students.find(s => s.id === e.studentId) || null,
      }));
    },
    create: async ({ data }: any) => {
      const e = { id: randomUUID(), ...data };
      memory.evaluations.push(e);
      return e;
    },
  },

  certificate: {
    findMany: async ({ where }: any = {}) => {
      return memory.certificates.filter(c => matchesFilter(c, where)).map(c => ({
        ...c,
        student: memory.students.find(s => s.id === c.studentId) || null,
      }));
    },
    findUnique: async ({ where }: any) => {
      return memory.certificates.find(c => (where.id && c.id === where.id) || (where.certificateNumber && c.certificateNumber === where.certificateNumber)) || null;
    },
    create: async ({ data }: any) => {
      const c = { id: randomUUID(), status: 'VALID', issueDate: new Date(), ...data };
      memory.certificates.push(c);
      return c;
    },
    update: async ({ where, data }: any) => {
      const c = memory.certificates.find(item => item.id === where.id || item.certificateNumber === where.certificateNumber);
      if (c) Object.assign(c, data);
      return c;
    },
  },

  notification: {
    findMany: async ({ where }: any = {}) => {
      return memory.notifications.filter(n => matchesFilter(n, where));
    },
    create: async ({ data }: any) => {
      const notif = { id: randomUUID(), createdAt: new Date(), read: false, ...data };
      memory.notifications.push(notif);
      return notif;
    },
    update: async ({ where, data }: any) => {
      const n = memory.notifications.find(item => item.id === where.id);
      if (n) Object.assign(n, data);
      return n;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      memory.notifications.forEach(n => {
        if (matchesFilter(n, where)) {
          Object.assign(n, data);
          count++;
        }
      });
      return { count };
    },
  },

  auditLog: {
    findMany: async ({ where }: any = {}) => {
      return memory.auditLogs.filter(a => matchesFilter(a, where));
    },
    create: async ({ data }: any) => {
      const log = { id: randomUUID(), createdAt: new Date(), ...data };
      memory.auditLogs.push(log);
      return log;
    },
  },

  systemSetting: {
    findMany: async () => [
      { id: '1', key: 'platform_name', value: { name: 'AZAAM International Medics Network', shortName: 'AZAAM' }, updatedAt: new Date() },
      { id: '2', key: 'academic_year', value: { current: '2026-2027', term: 'Fall/Spring Clinical Cycle' }, updatedAt: new Date() },
      { id: '3', key: 'application_window', value: { open: true, deadline: '2026-12-31' }, updatedAt: new Date() },
      { id: '4', key: 'security_policy', value: { jwtExpiry: '24h', requireMfaForSuperAdmin: true, auditRetentionDays: 365 }, updatedAt: new Date() },
    ],
    upsert: async ({ where, update, create }: any) => ({ id: randomUUID(), key: where.key, value: create?.value || update?.value, updatedAt: new Date() }),
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
};

let prismaInstance: any = inMemoryPrisma;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock') && !process.env.DATABASE_URL.includes('localhost')) {
  try {
    prismaInstance = new PrismaClient();
  } catch (e) {
    console.warn('[AI Studio] Using in-memory database store');
    prismaInstance = inMemoryPrisma;
  }
}

export const prisma = prismaInstance;
export default prisma;
