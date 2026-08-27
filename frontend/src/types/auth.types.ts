export type UserRole =
  | 'SUPER_ADMIN'
  | 'AZAAM_STAFF'
  | 'UNIVERSITY_USER'
  | 'ORGANIZATION_USER'
  | 'SUPERVISOR'
  | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  roles: UserRole[];
  permissions: string[];
  student?: {
    id: string;
    fullName: string;
    source: string;
    profileCompleted: boolean;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}
