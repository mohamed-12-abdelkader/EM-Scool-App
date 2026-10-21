import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

export type AuthUser = {
  id: string;
  email?: string | null;
  full_name: string;
  role: string;
  tenantId: string | null;
  branchIds: string[];
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  login: (
    identifier: string,
    password: string,
    tenantId?: string,
    phone?: string,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  ready: boolean;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = 'em.phase1.auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setAccessToken(parsed.accessToken);
        setRefreshToken(parsed.refreshToken);
        setActiveChildId(parsed.activeChildId ?? null);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = async (next: {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    activeChildId: string | null;
  }) => {
    setUser(next.user);
    setAccessToken(next.accessToken);
    setRefreshToken(next.refreshToken);
    setActiveChildId(next.activeChildId);
    if (!next.user) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      refreshToken,
      activeChildId,
      setActiveChildId: (id) => {
        void persist({ user, accessToken, refreshToken, activeChildId: id });
      },
      ready,
      login: async (identifier, password, tenantId, phone) => {
        const body: Record<string, unknown> = { password, tenantId };
        if (phone) body.phone = phone;
        else if (identifier.includes('@')) body.email = identifier;
        else body.phone = identifier;

        const result = await apiRequest<{
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
        }>('/v1/auth/login', {
          method: 'POST',
          body,
        });
        await persist({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeChildId: null,
        });
        return result.user;
      },
      logout: async () => {
        await persist({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeChildId: null,
        });
      },
    }),
    [user, accessToken, refreshToken, activeChildId, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requires AuthProvider');
  return ctx;
}

export function roleHome(role: string) {
  switch (role) {
    case 'PLATFORM_SUPER_ADMIN':
      return '/(super-admin)';
    case 'GROUP_EXECUTIVE':
    case 'SCHOOL_ADMIN':
    case 'ADMISSIONS_OFFICER':
    case 'ACADEMIC_COORDINATOR':
    case 'FINANCE_MANAGER':
      return '/(school-admin)';
    case 'TEACHER':
      return '/(teacher)';
    case 'PARENT':
      return '/(parent)';
    case 'STUDENT':
      return '/(student)';
    case 'LIBRARIAN':
    case 'TRANSPORT_MANAGER':
    case 'HR_SPECIALIST':
      return '/(operations)';
    default:
      return '/(dashboard)';
  }
}
