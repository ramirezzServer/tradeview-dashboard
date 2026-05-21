import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

// ─── Accent color → HSL mapping ──────────────────────────────────────────────

const ACCENT_COLORS: Record<string, { primary: string; accent: string }> = {
  Blue:   { primary: '217 91% 60%', accent: '217 45% 16%' },
  Cyan:   { primary: '188 91% 45%', accent: '188 55% 14%' },
  Green:  { primary: '142 71% 45%', accent: '142 45% 14%' },
  Purple: { primary: '270 70% 60%', accent: '270 45% 16%' },
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
    const color = ACCENT_COLORS[accent] ?? ACCENT_COLORS.Blue;
    const root = document.documentElement;
    root.style.setProperty('--primary', color.primary);
    root.style.setProperty('--primary-foreground', '230 25% 3.5%');
    root.style.setProperty('--ring', color.primary);
    root.style.setProperty('--chart-accent', color.primary);
    root.style.setProperty('--card-glow', color.primary);
    root.style.setProperty('--accent', color.accent);
    root.style.setProperty('--accent-foreground', '210 40% 96%');
    root.style.setProperty('--sidebar-primary', color.primary);
    root.style.setProperty('--sidebar-ring', color.primary);
    root.style.setProperty('--sidebar-accent', color.accent);
    root.style.setProperty('--sidebar-accent-foreground', '210 40% 96%');
  }, [settings?.appearance_prefs?.accent_color]);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}
