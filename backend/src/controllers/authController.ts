import { Request, Response, NextFunction } from 'express';
import { login, register } from '../services/authService';
import { loginSchema, registerSchema } from '../validators/auth';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { success } from '../utils/response';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);

    const user = await register(parsed.data);
    const message = user.status === 'PENDING'
      ? 'Account submitted for AZAAM review'
      : 'Account registered';

    return success(res, { user }, message, 201);
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(res, await login(parsed.data.email, parsed.data.password), 'Login successful');
  } catch (error) {
    next(error);
  }
}

export function meController(req: Request, res: Response) {
  if (!req.authUser) throw new UnauthorizedError();
  return success(res, { user: req.authUser });
}

export function logoutController(_req: Request, res: Response) {
  return success(res, null, 'Logout successful');
}
