import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { summary } from '../controllers/dashboardController';
const router = Router();
router.get('/admin/summary', authenticate, requirePermission('students.view'), summary);
export default router;
