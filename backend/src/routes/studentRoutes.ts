import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { getMyProfile, updateMyProfile } from '../controllers/studentController';
const router = Router();
router.use(authenticate);
router.get('/me', requirePermission('students.view'), getMyProfile);
router.post('/profile', requirePermission('students.update'), updateMyProfile);
export default router;
