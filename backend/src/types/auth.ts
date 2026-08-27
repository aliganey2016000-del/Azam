export type AuthUser = { id: string; email: string; status: string; roles: string[]; permissions: string[] };
export type AuthRole = { role: { name: string; permissions: { permission: { key: string } }[] } };

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'APPROVED'
  | 'PLACEMENT_PENDING'
  | 'PLACED'
  | 'SUPERVISOR_ASSIGNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CERTIFICATE_ISSUED'
  | 'REJECTED';

export type StudentSource = 'UNIVERSITY' | 'ORGANIZATION' | 'INDEPENDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
