import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { AuthContextType, AuthUser, UserRole } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('azam_token') || localStorage.getItem('azam_token');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    api.get('/auth/me')
      .then(({ data }) => {
        const rawUser = data?.data?.user || data?.data;
        if (isMounted && rawUser && rawUser.id) {
          const authUserData: AuthUser = {
            id: rawUser.id,
            email: rawUser.email || '',
            status: rawUser.status || 'ACTIVE',
            roles: rawUser.roles || [],
            permissions: rawUser.permissions || [],
            fullName: rawUser.student?.fullName || (rawUser.email ? rawUser.email.split('@')[0] : 'User'),
            student: rawUser.student,
          };
          setUser(authUserData);
        }
      })
      .catch((err) => {
        // Only clear token if server responded with 401 Unauthorized
        if (isMounted) {
          if (err?.response?.status === 401) {
            sessionStorage.removeItem('azam_token');
            localStorage.removeItem('azam_token');
            setUser(null);
            setToken(null);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post('/auth/login', { email, password });
    const newToken = data.data.token;
    const rawUser = data.data.user || data.data;

    const authUserData: AuthUser = {
      id: rawUser.id,
      email: rawUser.email || '',
      status: rawUser.status || 'ACTIVE',
      roles: rawUser.roles || [],
      permissions: rawUser.permissions || [],
      fullName: rawUser.student?.fullName || (rawUser.email ? rawUser.email.split('@')[0] : 'User'),
      student: rawUser.student,
    };

    sessionStorage.setItem('azam_token', newToken);
    localStorage.setItem('azam_token', newToken);
    setToken(newToken);
    setUser(authUserData);
    setLoading(false);
    return authUserData;
  };

  const setSession = (newToken: string, newUser: AuthUser) => {
    sessionStorage.setItem('azam_token', newToken);
    localStorage.setItem('azam_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    sessionStorage.removeItem('azam_token');
    localStorage.removeItem('azam_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.permissions.includes(permission);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return user.roles.some((r) => roles.includes(r));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, setSession, logout, hasPermission, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
