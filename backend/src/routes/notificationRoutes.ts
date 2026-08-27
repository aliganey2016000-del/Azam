import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/notificationController';

// Genuine per-user notification center: requires only authentication (no role restriction), and
// every handler is scoped strictly to req.authUser.id inside notificationService. This is what
// STUDENT / SUPERVISOR / UNIVERSITY_USER / ORGANIZATION_USER accounts use to see their own
// notifications -- distinct from the SUPER_ADMIN/AZAAM_STAFF-only oversight view under
// /api/v1/admin/notifications.
const router = Router();

router.use(authenticate);
router.get('/', controller.list);
router.patch('/:id/read', controller.markRead);
router.post('/read-all', controller.markAllRead);

export default router;
