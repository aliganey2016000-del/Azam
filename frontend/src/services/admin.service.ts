import { api } from '../api/client';
import {
  AdminSummary,
  ApplicationItem,
  StudentItem,
  UniversityItem,
  OrganizationItem,
  SupervisorItem,
  PlacementItem,
  AttendanceRecord,
  LogbookRecord,
  EvaluationRecord,
  CertificateRecord,
  DocumentRecord,
  NotificationRecord,
  AuditLogRecord,
  SystemSettingRecord,
} from '../types/admin.types';

export const adminService = {
  // Summary
  getSummary: async (): Promise<AdminSummary> => {
    const { data } = await api.get('/dashboard/admin/summary');
    return data.data;
  },

  // Applications
  getApplications: async (): Promise<ApplicationItem[]> => {
    const { data } = await api.get('/applications');
    return data.data.items || [];
  },

  getApplication: async (id: string): Promise<ApplicationItem> => {
    const { data } = await api.get(`/applications/${id}`);
    return data.data;
  },

  approveApplication: async (id: string, comment?: string): Promise<ApplicationItem> => {
    const { data } = await api.post(`/applications/${id}/approve`, { comment });
    return data.data;
  },

  rejectApplication: async (id: string, comment: string): Promise<ApplicationItem> => {
    const { data } = await api.post(`/applications/${id}/reject`, { comment });
    return data.data;
  },

  requestDocuments: async (id: string, comment: string): Promise<ApplicationItem> => {
    const { data } = await api.post(`/applications/${id}/request-documents`, { comment });
    return data.data;
  },

  // Students
  getStudents: async (): Promise<StudentItem[]> => {
    const { data } = await api.get('/admin/students');
    return data.data.items || [];
  },

  getStudent: async (id: string): Promise<StudentItem> => {
    const { data } = await api.get(`/admin/students/${id}`);
    return data.data;
  },

  // Universities
  getUniversities: async (): Promise<UniversityItem[]> => {
    const { data } = await api.get('/admin/universities');
    return data.data.items || [];
  },

  // Organizations
  getOrganizations: async (): Promise<OrganizationItem[]> => {
    const { data } = await api.get('/admin/organizations');
    return data.data.items || [];
  },

  // Supervisors
  getSupervisors: async (): Promise<SupervisorItem[]> => {
    const { data } = await api.get('/admin/supervisors');
    return data.data.items || [];
  },

  // Programmes & Specialties
  getProgrammes: async (): Promise<any[]> => {
    const { data } = await api.get('/admin/programmes');
    return data.data.items || [];
  },

  getSpecialties: async (): Promise<any[]> => {
    const { data } = await api.get('/admin/specialties');
    return data.data.items || [];
  },

  // Placements & Clinical Engine
  getPlacements: async (): Promise<PlacementItem[]> => {
    const { data } = await api.get('/admin/placements');
    return data.data.items || [];
  },

  createPlacement: async (payload: {
    applicationId: string;
    organizationId: string;
    departmentId: string;
    specialtyId?: string;
    supervisorId?: string;
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    const { data } = await api.post('/placements', payload);
    return data.data;
  },

  assignSupervisor: async (placementId: string, supervisorId: string): Promise<any> => {
    const { data } = await api.post(`/placements/${placementId}/supervisor`, { supervisorId });
    return data.data;
  },

  recordAttendance: async (attachmentId: string, payload: { date: string; status: string; comment?: string }): Promise<any> => {
    const { data } = await api.post(`/placements/attachment/${attachmentId}/attendance`, payload);
    return data.data;
  },

  submitLogbookEntry: async (attachmentId: string, payload: { date: string; clinicalArea: string; content: any }): Promise<any> => {
    const { data } = await api.post(`/placements/attachment/${attachmentId}/logbook`, payload);
    return data.data;
  },

  reviewLogbookEntry: async (logbookId: string, payload: { status: string; comment?: string }): Promise<any> => {
    const { data } = await api.patch(`/placements/logbook/${logbookId}/review`, payload);
    return data.data;
  },

  submitEvaluation: async (attachmentId: string, payload: { type: string; scores: any[] }): Promise<any> => {
    const { data } = await api.post(`/placements/attachment/${attachmentId}/evaluation`, payload);
    return data.data;
  },

  issueCertificate: async (attachmentId: string): Promise<any> => {
    const { data } = await api.post(`/placements/attachment/${attachmentId}/certificate`);
    return data.data;
  },

  // Attendance
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const { data } = await api.get('/admin/attendance');
    return data.data.items || [];
  },

  // Logbooks
  getLogbooks: async (): Promise<LogbookRecord[]> => {
    const { data } = await api.get('/admin/logbooks');
    return data.data.items || [];
  },

  // Evaluations
  getEvaluations: async (): Promise<EvaluationRecord[]> => {
    const { data } = await api.get('/admin/evaluations');
    return data.data.items || [];
  },

  // Certificates
  getCertificates: async (): Promise<CertificateRecord[]> => {
    const { data } = await api.get('/admin/certificates');
    return data.data.items || [];
  },

  verifyCertificate: async (number: string): Promise<{ valid: boolean; certificate?: CertificateRecord; message?: string }> => {
    const { data } = await api.get(`/admin/certificates/verify?number=${encodeURIComponent(number)}`);
    return data.data;
  },

  revokeCertificate: async (id: string, reason: string): Promise<CertificateRecord> => {
    const { data } = await api.post(`/admin/certificates/${id}/revoke`, { reason });
    return data.data;
  },

  // Documents
  getDocuments: async (): Promise<DocumentRecord[]> => {
    const { data } = await api.get('/documents');
    return data.data.items || [];
  },

  getDocument: async (id: string): Promise<DocumentRecord> => {
    const { data } = await api.get(`/documents/${id}`);
    return data.data;
  },

  downloadDocument: async (id: string, fileName?: string): Promise<void> => {
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  verifyDocument: async (id: string, comment?: string): Promise<DocumentRecord> => {
    const { data } = await api.post(`/documents/${id}/verify`, { comment });
    return data.data;
  },

  rejectDocument: async (id: string, reason: string): Promise<DocumentRecord> => {
    const { data } = await api.post(`/documents/${id}/reject`, { reason });
    return data.data;
  },

  replaceDocument: async (id: string, file: File): Promise<DocumentRecord> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/documents/${id}/replace`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  // Users
  getUsers: async (): Promise<any[]> => {
    const { data } = await api.get('/admin/users');
    return data.data.items || [];
  },

  // Roles & Permissions
  getRolesPermissions: async (): Promise<{ roles: any[]; permissions: any[] }> => {
    const { data } = await api.get('/admin/roles-permissions');
    return data.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLogRecord[]> => {
    const { data } = await api.get('/admin/audit-logs');
    return data.data.items || [];
  },

  // System Settings
  getSettings: async (): Promise<SystemSettingRecord[]> => {
    const { data } = await api.get('/admin/settings');
    return data.data.items || [];
  },

  // Notifications
  getNotifications: async (): Promise<NotificationRecord[]> => {
    const { data } = await api.get('/admin/notifications');
    return data.data.items || [];
  },

  markNotificationRead: async (id: string): Promise<NotificationRecord> => {
    const { data } = await api.patch(`/admin/notifications/${id}/read`);
    return data.data;
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.post('/admin/notifications/read-all');
  },

  // Per-user notifications (any authenticated role, not just SUPER_ADMIN/AZAAM_STAFF) --
  // strictly scoped server-side to the caller's own notifications.
  getMyNotifications: async (): Promise<NotificationRecord[]> => {
    const { data } = await api.get('/notifications');
    return data.data.items || [];
  },

  markMyNotificationRead: async (id: string): Promise<NotificationRecord> => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },

  markAllMyNotificationsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },

  // Search
  globalSearch: async (query: string): Promise<any> => {
    const { data } = await api.get(`/admin/search?q=${encodeURIComponent(query)}`);
    return data.data;
  },
};
