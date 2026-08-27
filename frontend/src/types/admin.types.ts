export interface AdminSummary {
  students: number;
  universities: number;
  organizations: number;
  pendingApplications: number;
  approvedApplications: number;
  activeApplications: number;
  activePlacements?: number;
  certificatesIssued?: number;
  verifiedDocuments?: number;
}

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

export type ApplicantSource = 'UNIVERSITY' | 'ORGANIZATION' | 'INDEPENDENT';

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  studentId: string;
  student?: {
    id: string;
    fullName: string;
    phone?: string;
    nationality?: string;
    source?: ApplicantSource;
  };
  universityId?: string | null;
  university?: { id: string; name: string; code?: string } | null;
  organizationId?: string | null;
  organization?: { id: string; name: string } | null;
  programmeId?: string | null;
  programme?: { id: string; name: string } | null;
  specialtyId?: string | null;
  specialty?: { id: string; name: string } | null;
  preferredCountryId?: string | null;
  preferredCountry?: { id: string; name: string } | null;
  preferredCityId?: string | null;
  preferredCity?: { id: string; name: string } | null;
  preferredStartDate?: string;
  preferredEndDate?: string;
  clinicalInterests?: string;
  source: ApplicantSource;
  status: ApplicationStatus;
  documents?: any[];
  history?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentItem {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  nationality?: string;
  source: ApplicantSource;
  universityId?: string | null;
  university?: { id: string; name: string } | null;
  organizationId?: string | null;
  organization?: { id: string; name: string } | null;
  programmeId?: string | null;
  programme?: { id: string; name: string } | null;
  countryId?: string | null;
  country?: { id: string; name: string } | null;
  profileCompleted: boolean;
  user?: { email: string; status: string };
  applications?: ApplicationItem[];
  placements?: any[];
}

export interface UniversityItem {
  id: string;
  name: string;
  code?: string;
  countryId?: string;
  address?: string;
  contactEmail?: string;
  status?: string;
  createdAt: string;
  studentsCount?: number;
  applicationsCount?: number;
}

export interface OrganizationItem {
  id: string;
  name: string;
  type?: string;
  countryId?: string;
  cityId?: string;
  address?: string;
  contactEmail?: string;
  departmentsCount?: number;
  supervisorsCount?: number;
  applicationsCount?: number;
  totalCapacity?: number;
  occupiedCapacity?: number;
  availableCapacity?: number;
  capacityWarning?: boolean;
  status?: string;
  createdAt: string;
}

export interface SupervisorItem {
  id: string;
  userId: string;
  name?: string;
  specialty?: string;
  department?: string;
  organizationId: string;
  organization?: { id: string; name: string };
  user?: { fullName?: string; email: string; status: string };
  activeStudentsCount?: number;
}

export interface PlacementItem {
  id: string;
  applicationId: string;
  studentId: string;
  student?: { id: string; fullName: string };
  organizationId: string;
  organization?: { id: string; name: string };
  departmentId?: string;
  department?: { id: string; name: string };
  specialtyId?: string;
  specialty?: { id: string; name: string };
  supervisorId?: string;
  supervisor?: { id: string; user?: { fullName?: string } };
  attachment?: { id: string };
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'SUPERVISOR_ASSIGNED' | 'COMPLETED' | 'CERTIFICATE_ISSUED' | 'CANCELLED';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  placementId?: string;
  attachmentId?: string;
  attachment?: { id?: string; placement?: PlacementItem };
  studentId: string;
  student?: { fullName: string };
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  checkIn?: string;
  checkOut?: string;
  comment?: string;
}

export interface LogbookRecord {
  id: string;
  studentId: string;
  student?: { fullName: string };
  placementId?: string;
  attachmentId?: string;
  attachment?: { id?: string; placement?: PlacementItem };
  date: string;
  clinicalArea: string;
  content: {
    procedure?: string;
    casesCount?: number;
    reflection?: string;
    activity?: string;
    notes?: string;
  };
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED' | 'VERIFIED' | 'REJECTED';
  supervisorComment?: string;
}

export interface EvaluationRecord {
  id: string;
  studentId: string;
  student?: { fullName: string };
  placementId?: string;
  attachmentId?: string;
  attachment?: { id?: string; placement?: PlacementItem };
  type: 'MID_TERM' | 'FINAL';
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED';
  score?: number;
  maximum?: number;
  scores?: { category: string; score: number; maximum: number }[];
  submittedDate?: string;
  feedback?: string;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentId: string;
  student?: { fullName: string };
  recipientName?: string;
  programmeName?: string;
  specialtyName?: string;
  institutionName?: string;
  issueDate: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  revocationReason?: string;
}

export interface DocumentRecord {
  id: string;
  studentId?: string;
  student?: { fullName: string };
  title: string;
  documentType: string;
  fileUrl?: string;
  fileName?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemSettingRecord {
  id: string;
  key: string;
  value: any;
  updatedAt: string;
}
