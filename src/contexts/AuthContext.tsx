import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

type User = {
  id: string | number;
  email: string;
  name?: string;
  username?: string;
};

type LoginPayload = { username: string; password: string };
type SignupPayload = { username: string; password: string; name: string; email: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  signup: (data: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        // Since backend doesn't have /users/me endpoint yet, we'll use stored info
        setUser({ id: userId, email: '', name: '' });
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(data: LoginPayload) {
    const res = await api.post('/api/v1/users/login', data);
    const userId: number = res.data;
    if (userId) {
      // Store userId as token for now (backend returns userId instead of JWT)
      localStorage.setItem('token', userId.toString());
      localStorage.setItem('userId', userId.toString());
      setToken(userId.toString());
      // Set user info directly since we have userId
      setUser({ id: userId.toString(), email: data.username, name: data.username });
    }
  }

  async function signup(data: SignupPayload) {
    await api.post('/api/v1/users/sign-up', data);
    // Optionally auto-login after signup if API returns token
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }

  async function refreshMe() {
    // Backend doesn't have /users/me endpoint yet
    // User info is stored in localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUser({ id: userId, email: '', name: '' });
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, signup, logout, refreshMe }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


