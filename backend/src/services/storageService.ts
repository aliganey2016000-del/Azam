import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
export async function storePrivateFile(file: Express.Multer.File) { if (!allowedTypes.has(file.mimetype)) throw new Error('Unsupported document type'); const directory = path.resolve(env.UPLOAD_DIR); await mkdir(directory, { recursive: true }); const key = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`; await writeFile(path.join(directory, key), file.buffer, { flag: 'wx' }); return { key, fileName: file.originalname, mimeType: file.mimetype, fileSize: file.size }; }