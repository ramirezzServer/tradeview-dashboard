/**
 * Zustand auth store with expo-secure-store persistence.
 *
 * On app start: initialize() reads the stored token, validates it via /auth/me,
 * and populates user state.  The setTokenGetter call wires the token into the
 * Axios interceptor so every subsequent request carries the Bearer header.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setTokenGetter } from '../services/api';
import { login, register, logout, getMe } from '../services/auth';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

const TOKEN_KEY = 'tradeview_auth_token';

interface AuthState {
  token:           string | null;
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;

  /** Call once on app mount to restore session from secure storage */
  initialize: () => Promise<void>;
  login:      (payload: LoginPayload) => Promise<void>;
  register:   (payload: RegisterPayload) => Promise<void>;
  logout:     () => Promise<void>;
  /** Called by the Axios 401 interceptor to clear invalid sessions */
  clearSession: () => void;
  clearError:   () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire the token getter into the Axios interceptor immediately
  setTokenGetter(() => get().token);

  return {
    token:           null,
    user:            null,
    isAuthenticated: false,
    isLoading:       true,  // true until initialize() resolves
    error:           null,

    // ── Initialize ──────────────────────────────────────────────────────────
    initialize: async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
          set({ isLoading: false });
          return;
        }

        // Token exists — set it so Axios interceptor picks it up, then validate
        set({ token: stored });
        const user = await getMe();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        // Token expired / invalid
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    },

    // ── Login ────────────────────────────────────────────────────────────────
    login: async (payload) => {
      set({ error: null });
      try {
        const { user, token } = await login(payload);
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ token, user, isAuthenticated: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        set({ error: message });
        throw err;
      }
    },

    // ── Register ─────────────────────────────────────────────────────────────
    register: async (payload) => {
      set({ error: null });
      try {
        const { user, token } = await register(payload);
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ token, user, isAuthenticated: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        set({ error: message });
        throw err;
      }
    },

    // ── Logout ───────────────────────────────────────────────────────────────
    logout: async () => {
      try {
        await logout();
      } finally {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      }
    },

    // ── Internal helpers ─────────────────────────────────────────────────────
    clearSession: () => {
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      set({ token: null, user: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),
  };
});
