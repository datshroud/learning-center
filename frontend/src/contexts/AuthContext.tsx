import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { Role, User } from '../types/domain';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('learning_center_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    setLoading(true);
    api
      .get<User>('/auth/me')
      .then((response) => {
        if (active) {
          setUser(response.data);
        }
      })
      .catch(() => {
        localStorage.removeItem('learning_center_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      async login(username, password) {
        const response = await api.post<{ token: string; user: User }>('/auth/login', {
          username,
          password
        });
        localStorage.setItem('learning_center_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
      },
      logout() {
        localStorage.removeItem('learning_center_token');
        setToken(null);
        setUser(null);
      },
      hasRole(...roles) {
        return Boolean(user && roles.includes(user.role));
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

