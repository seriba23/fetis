'use client';

import { apiFetch } from './api';

const ACCESS_KEY = 'fetis-access-token';
const REFRESH_KEY = 'fetis-refresh-token';
const USER_KEY = 'fetis-user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatarUrl: string | null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }>(
    '/auth/login',
    { method: 'POST', body: { email, password } },
  );
  localStorage.setItem(ACCESS_KEY, res.tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, res.tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  return res.user;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  try {
    if (refreshToken) {
      await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } });
    }
  } catch {}
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function refresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    const res = await apiFetch<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { method: 'POST', body: { refreshToken } },
    );
    localStorage.setItem(ACCESS_KEY, res.tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, res.tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return true;
  } catch {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    return false;
  }
}
