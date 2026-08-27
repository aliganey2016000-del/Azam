import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { ValidationError } from '../utils/errors';

// --- Validation (preserved from the original local-disk-only implementation) ---
// MIME allowlist plus a magic-byte signature check so a renamed/spoofed file with a permitted
// extension/Content-Type but the wrong actual content is rejected before it is ever persisted.

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

function assertValidFile(file: Express.Multer.File) {
  if (!allowedTypes.has(file.mimetype)) {
    throw new ValidationError([{ message: 'Unsupported document type' }]);
  }

  const signatureCheck = signatures[file.mimetype];
  if (!signatureCheck || !signatureCheck(file.buffer)) {
    throw new ValidationError([{ message: 'File content does not match its declared type' }]);
  }
}

export interface StoredFile {
  key: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export type DownloadTarget =
  | { type: 'redirect'; url: string }
  | { type: 'stream'; buffer: Buffer };

// --- S3-compatible backend ---
// Works against any S3-compatible endpoint (AWS S3, MinIO, DigitalOcean Spaces, etc.) since it
// only relies on the standard S3 API surface used by @aws-sdk/client-s3.

const s3Enabled = env.STORAGE_PROVIDER === 's3';

let s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      // Path-style addressing is required by most non-AWS S3-compatible providers (e.g. MinIO).
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY!,
        secretAccessKey: env.S3_SECRET_KEY!,
      },
    });
  }
  return s3Client;
}

async function storeToS3(file: Express.Multer.File): Promise<StoredFile> {
  const key = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
  return { key, fileName: file.originalname, mimeType: file.mimetype, fileSize: file.size };
}

async function downloadFromS3(key: string): Promise<DownloadTarget> {
  const url = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }),
    { expiresIn: 300 }, // 5 minutes - short-lived, single-use-in-spirit signed download link
  );
  return { type: 'redirect', url };
}

async function deleteFromS3(key: string): Promise<void> {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }));
}

// --- Local-disk backend (fallback for local dev / when S3 env vars are not configured) ---

function localDirectory() {
  return path.resolve(env.UPLOAD_DIR);
}

async function storeToLocalDisk(file: Express.Multer.File): Promise<StoredFile> {
  const directory = localDirectory();
  await mkdir(directory, { recursive: true });
  const key = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  await writeFile(path.join(directory, key), file.buffer, { flag: 'wx' });
  return { key, fileName: file.originalname, mimeType: file.mimetype, fileSize: file.size };
}

async function downloadFromLocalDisk(key: string): Promise<DownloadTarget> {
  const buffer = await readFile(path.join(localDirectory(), key));
  return { type: 'stream', buffer };
}

async function deleteFromLocalDisk(key: string): Promise<void> {
  await unlink(path.join(localDirectory(), key)).catch(() => undefined);
}

// --- Public API ---

export async function storePrivateFile(file: Express.Multer.File): Promise<StoredFile> {
  assertValidFile(file);
  return s3Enabled ? storeToS3(file) : storeToLocalDisk(file);
}

export async function getDownloadTarget(key: string): Promise<DownloadTarget> {
  return s3Enabled ? downloadFromS3(key) : downloadFromLocalDisk(key);
}

export async function deleteStoredFile(key: string): Promise<void> {
  return s3Enabled ? deleteFromS3(key) : deleteFromLocalDisk(key);
}

export const storageBackend = s3Enabled ? 's3' : 'local';
