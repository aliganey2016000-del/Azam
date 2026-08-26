import { Request, Response, NextFunction } from 'express';
import { documentMetadataSchema } from '../validators/document';
import { ValidationError } from '../utils/errors';
import { createDocument, listDocuments } from '../services/documentService';
import { success } from '../utils/response';
export async function list(req: Request, res: Response, next: NextFunction) { try { return success(res, { items: await listDocuments(req.authUser!.id, req.authUser!.roles) }); } catch (error) { next(error); } }
export async function upload(req: Request, res: Response, next: NextFunction) { try { if (!req.file) throw new ValidationError([{ message: 'A document file is required' }]); const parsed = documentMetadataSchema.safeParse(req.body); if (!parsed.success) throw new ValidationError(parsed.error.issues); return success(res, await createDocument(req.authUser!.id, req.authUser!.roles, req.file, parsed.data.documentType, parsed.data.applicationId), 'Document uploaded', 201); } catch (error) { next(error); } }