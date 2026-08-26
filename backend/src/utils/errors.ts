export class AppError extends Error { constructor(public statusCode: number, message: string, public errors: unknown[] = []) { super(message); } }
export class ValidationError extends AppError { constructor(errors: unknown[] = []) { super(400, 'Validation failed', errors); } }
export class UnauthorizedError extends AppError { constructor(message = 'Authentication required') { super(401, message); } }
export class ForbiddenError extends AppError { constructor(message = 'You do not have permission to perform this action') { super(403, message); } }
export class NotFoundError extends AppError { constructor(message = 'Resource not found') { super(404, message); } }
export class ConflictError extends AppError { constructor(message = 'Resource conflict') { super(409, message); } }
