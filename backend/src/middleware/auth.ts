import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRole, AuthUser } from '../types/auth';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { prisma } from '../utils/prisma';
declare global { namespace Express { interface Request { authUser?: AuthUser } } }
export async function authenticate(req: Request, _res: Response, next: NextFunction) { try { const header = req.headers.authorization; if (!header?.startsWith('Bearer ')) throw new UnauthorizedError(); const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { sub: string }; const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } }); if (!user || user.status !== 'ACTIVE') throw new UnauthorizedError('Invalid or inactive account'); const roles = user.roles as AuthRole[]; req.authUser = { id: user.id, email: user.email, status: user.status, roles: roles.map((role) => role.role.name), permissions: [...new Set(roles.flatMap((role) => role.role.permissions.map((permission) => permission.permission.key)))] }; next(); } catch (error) { next(error instanceof jwt.JsonWebTokenError ? new UnauthorizedError('Invalid token') : error); } }
export const requirePermission = (permission: string) => (req: Request, _res: Response, next: NextFunction) => { if (!req.authUser?.permissions.includes(permission)) return next(new ForbiddenError()); next(); };
export const requireRoles = (roles: string[]) => (req: Request, _res: Response, next: NextFunction) => { if (!req.authUser || !req.authUser.roles.some((r) => roles.includes(r))) return next(new ForbiddenError('Insufficient permissions')); next(); };

