// ─── Authenticated Backend API Service ───────────────────────────────────────
// Wraps all authenticated calls to the Laravel backend.
// Reads the Bearer token from localStorage and attaches it automatically.
// Unwraps the standard { success, message, data } response envelope.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

const TOKEN_KEY = 'auth_token';

type UnauthorizedHandler = () => void;

const unauthorizedHandlers = new Set<UnauthorizedHandler>();

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function handleUnauthorized(): void {
  removeToken();
  unauthorizedHandlers.forEach(handler => handler());
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

const statusMessages: Record<number, string> = {
  400: 'Permintaan tidak dapat diproses. Periksa kembali data Anda.',
  401: 'Sesi Anda sudah berakhir. Silakan masuk lagi.',
  403: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  404: 'Data yang diminta tidak ditemukan.',
  422: 'Ada data yang belum valid. Periksa kembali isian Anda.',
  429: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
  500: 'Server sedang bermasalah. Coba lagi nanti.',
  502: 'Data market sedang tidak tersedia. Coba lagi nanti.',
  503: 'Data market sedang tidak tersedia. Coba lagi nanti.',
};

function firstValidationError(errors?: Record<string, string[]>): string | null {
  if (!errors) return null;
  const first = Object.values(errors).find(messages => messages.length > 0)?.[0];
  if (!first) return null;
  return first;
}

export function getHumanApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const validationMessage = firstValidationError(error.errors);
    if (validationMessage) {
      if (validationMessage.toLowerCase().includes('email') && validationMessage.toLowerCase().includes('valid')) {
        return 'Format email salah, pastikan menggunakan tanda @.';
      }
      return validationMessage;
    }

    if (error.status === 0) {
      return 'Koneksi internet bermasalah. Periksa jaringan Anda lalu coba lagi.';
    }

    return statusMessages[error.status] ?? 'Permintaan gagal. Coba lagi sebentar lagi.';
  }

  if (error instanceof TypeError) {
    return 'Koneksi internet bermasalah. Periksa jaringan Anda lalu coba lagi.';
  }

  return 'Terjadi kendala. Coba lagi sebentar lagi.';
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(0, getHumanApiError(error));
  }

  if (auth && res.status === 401) {
    handleUnauthorized();
  }

  // 204 No Content (typical DELETE response) — nothing to parse
  if (res.status === 204) {
    if (!res.ok) throw new ApiError(res.status, statusMessages[res.status] ?? 'Permintaan gagal.');
    return undefined as unknown as T;
  }

  // Safely parse JSON — guard against HTML error pages (502, nginx errors, etc.)
  let json: LaravelResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, getHumanApiError(new ApiError(res.status, 'Non-JSON response')));
  }

  if (!res.ok) {
    const apiError = new ApiError(res.status, json.message ?? 'Request failed', json.errors);
    throw new ApiError(res.status, getHumanApiError(apiError), json.errors);
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

  delete: <T>(path: string, body?: unknown, auth = true) =>
    request<T>('DELETE', path, body, auth),
};
