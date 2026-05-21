import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getToken } from '@/services/api';
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

const JSON_PREF_KEYS = [
  'notifications',
  'watchlist_prefs',
  'dashboard_prefs',
  'appearance_prefs',
] as const;

export function withSettingsDefaults(settings?: PartialSettings | null): UserSettings {
  const merged = {
    ...SETTINGS_DEFAULTS,
    ...settings,
    theme: 'dark',
  } as UserSettings;

  for (const key of JSON_PREF_KEYS) {
    merged[key] = {
      ...(SETTINGS_DEFAULTS[key] ?? {}),
      ...(settings?.[key] ?? {}),
    } as never;
  }

  return merged;
}

function mergeSettingsUpdate(current: UserSettings | undefined, updates: PartialSettings): PartialSettings {
  const base = withSettingsDefaults(current);
  const merged: PartialSettings = { ...updates, theme: 'dark' };

  for (const key of JSON_PREF_KEYS) {
    if (updates[key] !== undefined) {
      merged[key] = {
        ...(base[key] ?? {}),
        ...(updates[key] ?? {}),
      } as never;
    }
  }

  return merged;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Reads and writes the user's settings from the Laravel backend.
 * The backend auto-creates defaults on first GET, so data is always present.
 */
export function useSettings() {
  const qc = useQueryClient();
  const hasToken = Boolean(getToken());

  const query = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get<UserSettings>('/settings'),
    enabled: hasToken,
    retry: 1,
    staleTime: 60_000, // settings don't change often — cache for 1 min
  });

  const updateMutation = useMutation({
    mutationFn: (updates: PartialSettings) =>
      api.put<UserSettings>('/settings', mergeSettingsUpdate(qc.getQueryData<UserSettings>(['settings']), updates)),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ['settings'] });
      const previous = qc.getQueryData<UserSettings>(['settings']);
      const optimistic = withSettingsDefaults({
        ...previous,
        ...mergeSettingsUpdate(previous, updates),
      });
      qc.setQueryData(['settings'], optimistic);
      return { previous };
    },
    onError: (_error, _updates, context) => {
      if (context?.previous) {
        qc.setQueryData(['settings'], context.previous);
      }
    },
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], withSettingsDefaults(updated));
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      api.put<UserSettings>('/settings', SETTINGS_DEFAULTS),
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], withSettingsDefaults(updated));
    },
  });

  return {
    settings:       query.data ? withSettingsDefaults(query.data) : undefined,
    isLoading:      query.isLoading,
    updateSettings: (updates: PartialSettings) => updateMutation.mutateAsync(updates),
    resetSettings:  () => resetMutation.mutateAsync(),
    isSaving:       updateMutation.isPending,
    isResetting:    resetMutation.isPending,
  };
}
