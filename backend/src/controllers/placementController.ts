import { Request, Response, NextFunction } from 'express';
import * as placementService from '../services/placementService';

export async function handleCreatePlacement(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.authUser!;
    const result = await placementService.createPlacement(user.id, user.roles, req.body);
    res.status(201).json({ success: true, data: result, message: 'Placement created successfully' });
  } catch (error) {
    next(error);
  }
}

export async function handleAssignSupervisor(req: Request, res: Response, next: NextFunction) {
  try {
    const placementId = req.params.placementId as string;
    const { supervisorId } = req.body;
    const user = req.authUser!;
    const result = await placementService.assignSupervisorToPlacement(user.id, placementId, supervisorId);
    res.json({ success: true, data: result, message: 'Supervisor assigned successfully' });
  } catch (error) {
    next(error);
  }
}

export async function handleRecordAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const { date, status, comment } = req.body;
    const result = await placementService.recordAttendance(attachmentId, date, status, comment);
    res.json({ success: true, data: result, message: 'Attendance recorded' });
  } catch (error) {
    next(error);
  }
}

export async function handleLogbookEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const { date, clinicalArea, content } = req.body;
    const result = await placementService.submitLogbookEntry(attachmentId, date, clinicalArea, content);
    res.status(201).json({ success: true, data: result, message: 'Logbook entry submitted' });
  } catch (error) {
    next(error);
  }
}

export async function handleReviewLogbookEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const logbookId = req.params.logbookId as string;
    const { status, comment } = req.body;
    const result = await placementService.reviewLogbookEntry(logbookId, status, comment);
    res.json({ success: true, data: result, message: 'Logbook entry reviewed' });
  } catch (error) {
    next(error);
  }
}

export async function handleEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const { type, scores } = req.body;
    const user = req.authUser!;
    const result = await placementService.submitEvaluation(attachmentId, type, user.id, scores);
    res.json({ success: true, data: result, message: 'Evaluation submitted' });
  } catch (error) {
    next(error);
  }
}

export async function handleIssueCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const user = req.authUser!;
    const result = await placementService.issueCertificate(user.id, attachmentId);
    res.status(201).json({ success: true, data: result, message: 'Certificate issued successfully' });
  } catch (error) {
    next(error);
  }
}

