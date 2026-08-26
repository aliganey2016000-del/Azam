import { Response } from 'express';
export const success = (res: Response, data: unknown, message = 'Request completed successfully', status = 200) => res.status(status).json({ success: true, data, message });
