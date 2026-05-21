import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, getToken, setToken, removeToken, registerUnauthorizedHandler } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if a token exists, validate it by calling /auth/me
  useEffect(() => {
    const unregisterUnauthorizedHandler = registerUnauthorizedHandler(() => {
      setUser(null);
      qc.clear();
    });

    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return unregisterUnauthorizedHandler;
    }

    api.get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => {
        // Token invalid or expired — clear it
        removeToken();
        qc.clear();
      })
      .finally(() => setIsLoading(false));

    return unregisterUnauthorizedHandler;
  }, [qc]);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ user: AuthUser; token: string }>(
      '/auth/login',
      { email, password },
      false // no auth header needed for login
    );
    setToken(data.token);
    qc.clear();
    setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> => {
    const data = await api.post<{ user: AuthUser; token: string }>(
      '/auth/register',
      { name, email, password, password_confirmation: passwordConfirmation },
      false
    );
    setToken(data.token);
    qc.clear();
    setUser(data.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      removeToken();
      qc.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
