/**
 * Auth service — login, register, logout, me.
 * Uses the apiClient directly (token injected via interceptor).
 */
import { post, get } from './api';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // No auth header needed — Laravel returns the token
  return post<AuthResponse>('/auth/login', payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/register', payload);
}

export async function logout(): Promise<void> {
  try {
    await post<void>('/auth/logout', {});
  } catch {
    // Even if the server call fails, clear client-side state
  }
}

export async function getMe(): Promise<AuthUser> {
  return get<AuthUser>('/auth/me');
}
