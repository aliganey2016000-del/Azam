import { Request, Response, NextFunction } from 'express';
import { getAdminSummary } from '../services/dashboardService';
import { success } from '../utils/response';
export async function summary(_req: Request, res: Response, next: NextFunction) { try { return success(res, await getAdminSummary()); } catch (error) { next(error); } }
