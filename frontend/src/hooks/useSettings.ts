import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { UserSettings, PartialSettings } from '@shared/schemas/settings';

export type { UserSettings, PartialSettings };

// ─── Factory defaults — sent to backend on resetSettings() ────────────────────

export const SETTINGS_DEFAULTS: PartialSettings = {
  theme:                    'dark',
  currency:                 'USD',
  default_resolution:       'D',
  default_symbol:           'AAPL',
  preferred_news_category:  'general',
  density:                  'Normal',
  font_size:                'Medium',
  chart_timeframe:          '1M',
  notifications: {
    price_alerts:       true,
    news_updates:       true,
    portfolio_changes:  true,
    earnings_reminders: false,
  },
  watchlist_prefs: {
    live_price_updates: true,
    flash_animations:   true,
    show_sparklines:    true,
    sort_by:            'Change',
  },
  dashboard_prefs: {
    ai_predictions: true,
    market_movers:  true,
    daily_range:    true,
    volume_bars:    true,
  },
  appearance_prefs: {
    accent_color: 'Blue',
    chart_style:  'Candles',
    glow_effects: true,
    animations:   true,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Reads and writes the user's settings from the Laravel backend.
 * The backend auto-creates defaults on first GET, so data is always present.
 */
export function useSettings() {
  const qc = useQueryClient();

  const query = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get<UserSettings>('/settings'),
    retry: 1,
    staleTime: 60_000, // settings don't change often — cache for 1 min
  });

  const updateMutation = useMutation({
    mutationFn: (updates: PartialSettings) =>
      api.put<UserSettings>('/settings', updates),
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], updated);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      api.put<UserSettings>('/settings', SETTINGS_DEFAULTS),
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], updated);
    },
  });

  return {
    settings:       query.data,
    isLoading:      query.isLoading,
    updateSettings: (updates: PartialSettings) => updateMutation.mutateAsync(updates),
    resetSettings:  () => resetMutation.mutateAsync(),
    isSaving:       updateMutation.isPending,
    isResetting:    resetMutation.isPending,
  };
}
