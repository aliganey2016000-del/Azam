import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth';
import {
  handleCreatePlacement,
  handleAssignSupervisor,
  handleRecordAttendance,
  handleLogbookEntry,
  handleReviewLogbookEntry,
  handleEvaluation,
  handleIssueCertificate,
} from '../controllers/placementController';

const router = Router();

router.use(authenticate);

// Placement creation & supervisor assignment (Admin/Staff)
router.post('/', requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF']), handleCreatePlacement);
router.post('/:placementId/supervisor', requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF', 'ORGANIZATION_ADMIN']), handleAssignSupervisor);

// Attendance
router.post('/attachment/:attachmentId/attendance', handleRecordAttendance);

// Logbook
router.post('/attachment/:attachmentId/logbook', handleLogbookEntry);
router.patch('/logbook/:logbookId/review', requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF', 'SUPERVISOR']), handleReviewLogbookEntry);

// Evaluation
router.post('/attachment/:attachmentId/evaluation', requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF', 'SUPERVISOR']), handleEvaluation);

// Certificate Issuance
router.post('/attachment/:attachmentId/certificate', requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF']), handleIssueCertificate);

export default router;
