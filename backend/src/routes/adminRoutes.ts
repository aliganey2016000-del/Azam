import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth';
import {
  listStudents,
  studentDetail,
  listUniversities,
  listOrganizations,
  listSupervisors,
  listProgrammes,
  listSpecialties,
  listPlacements,
  listAttendance,
  listLogbooks,
  listEvaluations,
  listCertificates,
  checkCertificateVerification,
  revokeCert,
  listUsers,
  listRolesPermissions,
  listAuditLogs,
  listSettings,
  listNotifications,
  markRead,
  markAllRead,
  search,
} from '../controllers/adminController';

const router = Router();

// Public certificate verification endpoint
router.get('/certificates/verify', checkCertificateVerification);

// Admin-protected routes
router.use(authenticate);
router.use(requireRoles(['SUPER_ADMIN', 'AZAAM_STAFF']));

router.get('/students', listStudents);
router.get('/students/:id', studentDetail);
router.get('/universities', listUniversities);
router.get('/organizations', listOrganizations);
router.get('/supervisors', listSupervisors);
router.get('/programmes', listProgrammes);
router.get('/specialties', listSpecialties);
router.get('/placements', listPlacements);
router.get('/attendance', listAttendance);
router.get('/logbooks', listLogbooks);
router.get('/evaluations', listEvaluations);
router.get('/certificates', listCertificates);
router.post('/certificates/:id/revoke', revokeCert);
router.get('/users', listUsers);
router.get('/roles-permissions', listRolesPermissions);
router.get('/audit-logs', listAuditLogs);
router.get('/settings', listSettings);
router.get('/notifications', listNotifications);
router.patch('/notifications/:id/read', markRead);
router.post('/notifications/read-all', markAllRead);
router.get('/search', search);

export default router;
