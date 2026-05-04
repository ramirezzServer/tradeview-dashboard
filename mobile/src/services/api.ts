/**
 * Axios API client — wraps all calls to the Laravel backend.
 *
 * • Auth token is read from Zustand authStore (memory) on every request.
 * • Response interceptor unwraps the standard { success, message, data } envelope.
 * • On 401 the store is cleared so the auth gate redirects to Login.
 */
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, type LaravelResponse } from '../types/api';

// ─── Config ──────────────────────────────────────────────────────────────────

export const API_BASE_URL = 'http://192.168.18.13:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — inject Bearer token ────────────────────────────────

/**
 * Token getter is injected by the auth store after initialisation.
 * Using a getter fn avoids a circular import.
 */
let _getToken: (() => string | null) | null = null;

export function setTokenGetter(fn: () => string | null): void {
  _getToken = fn;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — unwrap envelope / map errors ─────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse<LaravelResponse<unknown>>) => {
    // Pass the raw response through — unwrapping is done per-service call
    // so services can access meta / message when needed.
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const status  = error.response?.status ?? 0;
      const data    = error.response?.data as LaravelResponse<unknown> | undefined;
      const message = data?.message ?? error.message ?? 'Network error';
      const errors  = data?.errors;

      if (status === 401) {
        // Notify auth store to clear session — import lazily to avoid circulars
        import('../store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().clearSession();
        });
      }

      throw new ApiError(status, message, errors);
    }
    throw error;
  },
);

// ─── Typed request helpers ────────────────────────────────────────────────────

export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<LaravelResponse<T>>(path, config);
  if (!res.data.success) throw new ApiError(200, res.data.message);
  return res.data.data;
}

export async function post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<LaravelResponse<T>>(path, body, config);
  if (!res.data.success) throw new ApiError(200, res.data.message);
  return res.data.data;
}

export async function put<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<LaravelResponse<T>>(path, body, config);
  if (!res.data.success) throw new ApiError(200, res.data.message);
  return res.data.data;
}

export async function del<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<LaravelResponse<T>>(path, config);
  // 204 No Content — data will be undefined
  if (res.status === 204) return undefined as unknown as T;
  if (!res.data.success) throw new ApiError(200, res.data.message);
  return res.data.data;
}
