import { Request, Response, NextFunction } from 'express';
import {
  getAdminStudents,
  getAdminStudent,
  getAdminUniversities,
  getAdminOrganizations,
  getAdminSupervisors,
  getAdminProgrammes,
  getAdminSpecialties,
  getAdminPlacements,
  getAdminAttendance,
  getAdminLogbooks,
  getAdminEvaluations,
  getAdminCertificates,
  verifyCertificate,
  revokeCertificate,
  getAdminUsers,
  getAdminRolesPermissions,
  getAdminAuditLogs,
  getAdminSettings,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  globalAdminSearch,
} from '../services/adminService';
import { success } from '../utils/response';

export async function listStudents(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminStudents() });
  } catch (error) {
    next(error);
  }
}

export async function studentDetail(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await getAdminStudent(String(req.params.id)));
  } catch (error) {
    next(error);
  }
}

export async function listUniversities(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminUniversities() });
  } catch (error) {
    next(error);
  }
}

export async function listOrganizations(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminOrganizations() });
  } catch (error) {
    next(error);
  }
}

export async function listSupervisors(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminSupervisors() });
  } catch (error) {
    next(error);
  }
}

export async function listProgrammes(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminProgrammes() });
  } catch (error) {
    next(error);
  }
}

export async function listSpecialties(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminSpecialties() });
  } catch (error) {
    next(error);
  }
}

export async function listPlacements(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminPlacements() });
  } catch (error) {
    next(error);
  }
}

export async function listAttendance(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminAttendance() });
  } catch (error) {
    next(error);
  }
}

export async function listLogbooks(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminLogbooks() });
  } catch (error) {
    next(error);
  }
}

export async function listEvaluations(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminEvaluations() });
  } catch (error) {
    next(error);
  }
}

export async function listCertificates(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminCertificates() });
  } catch (error) {
    next(error);
  }
}

export async function checkCertificateVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const certNumber = String(req.query.number || req.body.number || '');
    return success(res, await verifyCertificate(certNumber));
  } catch (error) {
    next(error);
  }
}

export async function revokeCert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const reason = String(req.body.reason || 'Administrative revocation');
    return success(res, await revokeCertificate(id, reason), 'Certificate status updated to REVOKED');
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminUsers() });
  } catch (error) {
    next(error);
  }
}

export async function listRolesPermissions(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await getAdminRolesPermissions());
  } catch (error) {
    next(error);
  }
}

export async function listAuditLogs(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminAuditLogs() });
  } catch (error) {
    next(error);
  }
}

export async function listSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminSettings() });
  } catch (error) {
    next(error);
  }
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, { items: await getAdminNotifications(req.authUser!.id) });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await markNotificationRead(String(req.params.id)));
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await markAllNotificationsRead(req.authUser!.id));
  } catch (error) {
    next(error);
  }
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const query = String(req.query.q || '');
    return success(res, await globalAdminSearch(query));
  } catch (error) {
    next(error);
  }
}
