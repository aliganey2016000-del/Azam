import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { ValidationError } from '../utils/errors';

const allowedTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const signatures: Record<string, (buffer: Buffer) => boolean> = {
  'application/pdf': (buffer) => buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  'image/jpeg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'application/msword': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (buffer) => buffer.subarray(0, 2).equals(Buffer.from([0x50, 0x4b])),
};

export async function storePrivateFile(file: Express.Multer.File) {
  if (!allowedTypes.has(file.mimetype)) {
    throw new ValidationError([{ message: 'Unsupported document type' }]);
  }

  const signatureCheck = signatures[file.mimetype];
  if (!signatureCheck || !signatureCheck(file.buffer)) {
    throw new ValidationError([{ message: 'File content does not match its declared type' }]);
  }

  const directory = path.resolve(env.UPLOAD_DIR);
  await mkdir(directory, { recursive: true });
  const key = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  await writeFile(path.join(directory, key), file.buffer, { flag: 'wx' });
  return { key, fileName: file.originalname, mimeType: file.mimetype, fileSize: file.size };
}
