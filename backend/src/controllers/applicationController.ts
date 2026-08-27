import { Request, Response, NextFunction } from 'express';
import { ApplicationStatus } from '../types/auth';
import { applicationCreateSchema } from '../validators/application';
import { ValidationError } from '../utils/errors';
import { createApplication, getApplication, listApplications, transitionApplication } from '../services/applicationService';
import { success } from '../utils/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await listApplications(req.authUser!.id, req.authUser!.roles) });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = applicationCreateSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(res, await createApplication(req.authUser!.id, parsed.data), 'Application draft created', 201);
  } catch (error) {
    next(error);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    return success(res, await getApplication(req.authUser!.id, req.authUser!.roles, id));
  } catch (error) {
    next(error);
  }
}

export async function transition(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const target = (
      req.route.path.endsWith('/submit')
        ? 'SUBMITTED'
        : req.route.path.endsWith('/approve')
          ? 'APPROVED'
          : req.route.path.endsWith('/reject')
            ? 'REJECTED'
            : 'DOCUMENTS_REQUIRED'
    ) as ApplicationStatus;
    return success(res, await transitionApplication(req.authUser!.id, req.authUser!.roles, id, target, req.body.comment));
  } catch (error) {
    next(error);
  }
}
