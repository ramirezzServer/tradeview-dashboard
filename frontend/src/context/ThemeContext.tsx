import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

// ─── Accent color → HSL mapping ──────────────────────────────────────────────

const ACCENT_COLORS: Record<string, string> = {
  Blue:   '217 91% 60%',
  Cyan:   '188 91% 45%',
  Green:  '142 71% 45%',
  Purple: '270 70% 60%',
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark' });

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  // ── Theme class (dark / light) ────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // ── Density ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const density = (settings?.density ?? 'Normal').toLowerCase();
    document.documentElement.setAttribute('data-density', density);
  }, [settings?.density]);

  // ── Font size ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const size = (settings?.font_size ?? 'Medium').toLowerCase();
    document.documentElement.setAttribute('data-font-size', size);
  }, [settings?.font_size]);

  // ── Glow effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    const glow = settings?.appearance_prefs?.glow_effects ?? true;
    document.documentElement.classList.toggle('no-glow', !glow);
  }, [settings?.appearance_prefs?.glow_effects]);

  // ── Animations ────────────────────────────────────────────────────────────
  useEffect(() => {
    const anim = settings?.appearance_prefs?.animations ?? true;
    document.documentElement.classList.toggle('no-animations', !anim);
  }, [settings?.appearance_prefs?.animations]);

  // ── Accent color ──────────────────────────────────────────────────────────
  useEffect(() => {
    const accent = settings?.appearance_prefs?.accent_color ?? 'Blue';
    const hsl = ACCENT_COLORS[accent] ?? ACCENT_COLORS.Blue;
    const root = document.documentElement;
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    root.style.setProperty('--chart-accent', hsl);
    root.style.setProperty('--sidebar-primary', hsl);
    root.style.setProperty('--sidebar-ring', hsl);
  }, [settings?.appearance_prefs?.accent_color]);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}
