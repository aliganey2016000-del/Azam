import { Request, Response, NextFunction } from 'express';
import { getStudentForUser, updateStudentProfile } from '../services/studentService';
import { profileSchema } from '../validators/application';
import { ValidationError } from '../utils/errors';
import { success } from '../utils/response';
export async function getMyProfile(req: Request, res: Response, next: NextFunction) { try { return success(res, await getStudentForUser(req.authUser!.id)); } catch (error) { next(error); } }
export async function updateMyProfile(req: Request, res: Response, next: NextFunction) { try { const parsed = profileSchema.safeParse(req.body); if (!parsed.success) throw new ValidationError(parsed.error.issues); return success(res, await updateStudentProfile(req.authUser!.id, parsed.data)); } catch (error) { next(error); } }
