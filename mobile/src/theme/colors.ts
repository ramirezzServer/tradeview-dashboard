/**
 * TradeView Mobile — Design System Colors
 * Derived from the web dashboard dark theme (index.css .dark variables)
 *
 * background: hsl(230 25% 3.5%)  → #07080B
 * card:       hsl(228 22% 6%)    → #0C0D12
 * primary:    hsl(217 91% 60%)   → #3B82F6
 * bull:       hsl(142 71% 45%)   → #22C55E
 * bear:       hsl(0 84% 60%)     → #EF4444
 * border:     hsl(228 14% 11%)   → #181A20
 */

export const COLORS = {
  // ── Backgrounds ──────────────────────────────────────────
  background:    '#07080B',
  card:          '#0C0D12',
  cardElevated:  '#111420',
  cardHighlight: '#161B2E',

  // ── Borders ───────────────────────────────────────────────
  border:        '#181A20',
  borderSubtle:  '#0F1118',

  // ── Brand / Primary ───────────────────────────────────────
  primary:       '#3B82F6',
  primaryLight:  '#60A5FA',
  primaryDim:    '#1D4ED8',

  // ── Market Colors ─────────────────────────────────────────
  bull:          '#22C55E',   // green — gainers
  bullDim:       '#15803D',
  bear:          '#EF4444',   // red  — losers
  bearDim:       '#B91C1C',

  // ── Text ──────────────────────────────────────────────────
  text:          '#E2E8F0',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textDim:       '#334155',

  // ── Utility ───────────────────────────────────────────────
  warning:       '#F59E0B',
  warningDim:    '#78350F',
  info:          '#06B6D4',

  // ── Tab Bar ───────────────────────────────────────────────
  tabBar:        '#09090F',
  tabActive:     '#3B82F6',
  tabInactive:   '#475569',

  // ── Transparent overlays ──────────────────────────────────
  overlay:       'rgba(7, 8, 11, 0.85)',
  shimmer:       '#1A1F2E',
} as const;

export type Color = keyof typeof COLORS;
