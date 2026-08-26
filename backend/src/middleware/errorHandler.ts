import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => { const appError = error instanceof AppError ? error : new AppError(500, 'Internal server error'); res.status(appError.statusCode).json({ success: false, message: appError.message, errors: appError.errors }); };
