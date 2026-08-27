import { Request, Response, NextFunction } from 'express';
import { listNotificationsForUser, markNotificationReadForUser, markAllNotificationsReadForUser } from '../services/notificationService';
import { success } from '../utils/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await listNotificationsForUser(req.authUser!.id) });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await markNotificationReadForUser(req.authUser!.id, req.authUser!.roles, String(req.params.id)));
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await markAllNotificationsReadForUser(req.authUser!.id));
  } catch (error) {
    next(error);
  }
}
