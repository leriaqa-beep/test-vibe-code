import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    // Validate token by fetching current user
    fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((u: User) => {
        setToken(stored);
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const registerWithEmail = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithToken = async (newToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    if (!res.ok) throw new Error('Token validation failed');
    const u: User = await res.json();
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(u);
  };

  const refreshUser = async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    });
    if (!res.ok) return;
    const u: User = await res.json();
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginWithEmail, registerWithEmail, loginWithToken, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
