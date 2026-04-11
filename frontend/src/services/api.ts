// ─── Authenticated Backend API Service ───────────────────────────────────────
// Wraps all authenticated calls to the Laravel backend.
// Reads the Bearer token from localStorage and attaches it automatically.
// Unwraps the standard { success, message, data } response envelope.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core request function ────────────────────────────────────────────────────

interface LaravelResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (typical DELETE response) — nothing to parse
  if (res.status === 204) {
    if (!res.ok) throw new ApiError(res.status, 'Request failed');
    return undefined as unknown as T;
  }

  // Safely parse JSON — guard against HTML error pages (502, nginx errors, etc.)
  let json: LaravelResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, `Server returned a non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw new ApiError(res.status, json.message ?? 'Request failed', json.errors);
  }

  return json.data;
}

// ─── Public API object ────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string, auth = true) =>
    request<T>('GET', path, undefined, auth),

  post:   <T>(path: string, body: unknown, auth = true) =>
    request<T>('POST', path, body, auth),

  put:    <T>(path: string, body: unknown, auth = true) =>
    request<T>('PUT', path, body, auth),

  delete: <T>(path: string, auth = true) =>
    request<T>('DELETE', path, undefined, auth),
};
