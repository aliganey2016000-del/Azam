import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { AuthRole, AuthUser } from '../types/auth';
import { prisma } from '../utils/prisma';

type RegisterInput = {
  email: string;
  password: string;
  accountType: string;
  source: 'UNIVERSITY' | 'ORGANIZATION' | 'INDEPENDENT';
  fullName?: string;
  phone?: string;
  nationality?: string;
};

export async function register(input: RegisterInput): Promise<AuthUser> {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new ConflictError('Email is already registered');

  const roleName =
    input.accountType === 'STUDENT'
      ? 'STUDENT'
      : input.accountType === 'UNIVERSITY'
        ? 'UNIVERSITY_USER'
        : input.accountType === 'SUPERVISOR'
          ? 'SUPERVISOR'
          : 'ORGANIZATION_USER';

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new ConflictError('Account role is not configured');

  // Students may activate immediately. Institutional and supervisor accounts
  // require AZAAM review before they can authenticate with privileged roles.
  const status = input.accountType === 'STUDENT' ? 'ACTIVE' : 'PENDING';

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      status,
      roles: { create: { roleId: role.id } },
      ...(input.accountType === 'STUDENT'
        ? {
            student: {
              create: {
                fullName: input.fullName ?? 'New Student',
                phone: input.phone,
                nationality: input.nationality,
                source: input.source,
              },
            },
          }
        : {}),
    },
    include: {
      roles: {
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
    },
  });

  return toAuthUser(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
    },
  });

  if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const authUser = toAuthUser(user);
  return {
    user: authUser,
    token: jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '15m' }),
  };
}

export function toAuthUser(user: { id: string; email: string; status: string; roles: AuthRole[] }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    status: user.status,
    roles: user.roles.map((role) => role.role.name),
    permissions: [...new Set(user.roles.flatMap((role) => role.role.permissions.map((permission) => permission.permission.key)))],
  };
}
