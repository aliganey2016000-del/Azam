import { Router } from 'express';
import multer from 'multer';
import { env } from '../config/env';
import { authenticate, requirePermission } from '../middleware/auth';
import * as controller from '../controllers/documentController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE },
  fileFilter: (_req, file, callback) =>
    callback(
      null,
      ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
        file.mimetype,
      ),
    ),
});

router.use(authenticate);

router.get('/', requirePermission('documents.view'), controller.list);
router.post('/', requirePermission('documents.create'), upload.single('file'), controller.upload);
router.get('/:id', requirePermission('documents.view'), controller.detail);
router.get('/:id/download', requirePermission('documents.download'), controller.download);
router.post('/:id/submit', requirePermission('documents.create'), controller.submit);
router.post('/:id/verify', requirePermission('documents.verify'), controller.verify);
router.post('/:id/reject', requirePermission('documents.reject'), controller.reject);
router.post('/:id/replace', requirePermission('documents.create'), upload.single('file'), controller.replace);

export default router;
