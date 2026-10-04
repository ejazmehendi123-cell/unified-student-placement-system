import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; title: string; subtitle: string }> = {
  student: {
    email: 'student@usps.demo',
    pass: 'DemoPass@2026',
    title: 'Student Portal',
    subtitle: 'Aarav Sharma (B.Tech CSE, 8.75 CGPA)',
  },
  recruiter: {
    email: 'recruiter@usps.demo',
    pass: 'DemoPass@2026',
    title: 'Recruiter Portal',
    subtitle: 'Priya Deshmukh (Bharat Tech Innovations)',
  },
  tpo_admin: {
    email: 'admin@usps.demo',
    pass: 'DemoPass@2026',
    title: 'TPO / Admin Portal',
    subtitle: 'Dr. Ramesh Sundaram (Head of Placement)',
  },
  leadership: {
    email: 'leadership@usps.demo',
    pass: 'DemoPass@2026',
    title: 'Leadership / Dean',
    subtitle: 'Prof. K. Venkatesh (Dean of Academics)',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('usps_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('usps_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('usps_token')) {
        setIsLoading(false);
        return;
      }
      const res = await authApi.getMe();
      if (res.success && res.data.profile) {
        setUser(res.data.profile);
        localStorage.setItem('usps_user', JSON.stringify(res.data.profile));
      }
    } catch {
      localStorage.removeItem('usps_token');
      localStorage.removeItem('usps_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password: pass });
      if (res.success && res.data.token) {
        const u = res.data.user;
        setToken(res.data.token);
        setUser(u);
        localStorage.setItem('usps_token', res.data.token);
        localStorage.setItem('usps_user', JSON.stringify(u));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    const cred = DEMO_CREDENTIALS[targetRole];
    if (cred) {
      await login(cred.email, cred.pass);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('usps_token');
      localStorage.removeItem('usps_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
