import { Request, Response, NextFunction } from 'express';
import { documentMetadataSchema, documentRejectSchema, documentSubmitSchema, documentVerifySchema } from '../validators/document';
import { ValidationError } from '../utils/errors';
import {
  createDocument,
  downloadDocument,
  getDocument,
  listDocuments,
  rejectDocument,
  replaceDocument,
  submitDocument,
  verifyDocument,
} from '../services/documentService';
import { success } from '../utils/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await listDocuments(req.authUser!.id, req.authUser!.roles) });
  } catch (error) {
    next(error);
  }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ValidationError([{ message: 'A document file is required' }]);
    const parsed = documentMetadataSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(
      res,
      await createDocument(req.authUser!.id, req.authUser!.roles, req.file, parsed.data.documentType, parsed.data.applicationId),
      'Document uploaded',
      201,
    );
  } catch (error) {
    next(error);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await getDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id)));
  } catch (error) {
    next(error);
  }
}

export async function download(req: Request, res: Response, next: NextFunction) {
  try {
    const { document, target } = await downloadDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id));
    if (target.type === 'redirect') {
      return res.redirect(302, target.url);
    }
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName.replace(/"/g, '')}"`);
    return res.send(target.buffer);
  } catch (error) {
    next(error);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = documentSubmitSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(
      res,
      await submitDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id), parsed.data.applicationId),
      'Document submitted to application',
    );
  } catch (error) {
    next(error);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = documentVerifySchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(
      res,
      await verifyDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id), parsed.data.comment),
      'Document verified',
    );
  } catch (error) {
    next(error);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = documentRejectSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);
    return success(
      res,
      await rejectDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id), parsed.data.reason),
      'Document rejected',
    );
  } catch (error) {
    next(error);
  }
}

export async function replace(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ValidationError([{ message: 'A replacement document file is required' }]);
    return success(
      res,
      await replaceDocument(req.authUser!.id, req.authUser!.roles, String(req.params.id), req.file),
      'Document replaced',
      201,
    );
  } catch (error) {
    next(error);
  }
}
