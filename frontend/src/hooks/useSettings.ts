import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [isDebouncedSaving, setIsDebouncedSaving] = useState(false);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(() => new Set());
  const pendingUpdates = useRef<PartialSettings>({});
  const previousForPending = useRef<UserSettings | undefined>(undefined);
  const pendingResolvers = useRef<Array<{
    resolve: (settings: UserSettings) => void;
    reject: (error: unknown) => void;
  }>>([]);
  const saveTimer = useRef<number | null>(null);

  const query = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get<UserSettings>('/settings'),
    enabled: hasToken,
    retry: 1,
    staleTime: 60_000, // settings don't change often — cache for 1 min
  });

  const flushPending = useCallback(async () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    const updates = pendingUpdates.current;
    const resolvers = pendingResolvers.current;
    const previous = previousForPending.current;

    pendingUpdates.current = {};
    pendingResolvers.current = [];
    previousForPending.current = undefined;

    if (Object.keys(updates).length === 0) {
      setIsDebouncedSaving(false);
      return;
    }

    try {
      const merged = mergeSettingsUpdate(qc.getQueryData<UserSettings>(['settings']), updates);
      const updated = withSettingsDefaults(await api.put<UserSettings>('/settings', merged));
      qc.setQueryData(['settings'], updated);
      resolvers.forEach(({ resolve }) => resolve(updated));
    } catch (error) {
      if (previous) {
        qc.setQueryData<UserSettings>(['settings'], current => {
          const rollback = { ...(current ?? previous) } as UserSettings;
          for (const key of Object.keys(updates) as Array<keyof PartialSettings>) {
            rollback[key] = previous[key] as never;
          }
          return withSettingsDefaults(rollback);
        });
      }
      resolvers.forEach(({ reject }) => reject(error));
    } finally {
      setIsDebouncedSaving(false);
      setSavingKeys(current => {
        const next = new Set(current);
        for (const key of Object.keys(updates)) {
          next.delete(key);
        }
        return next;
      });
    }
  }, [qc]);

  const updateSettings = useCallback((updates: PartialSettings) => {
    setIsDebouncedSaving(true);
    const touchedKeys = Object.keys(updates);
    setSavingKeys(current => {
      const next = new Set(current);
      touchedKeys.forEach(key => next.add(key));
      return next;
    });

    void qc.cancelQueries({ queryKey: ['settings'] });

    const previous = qc.getQueryData<UserSettings>(['settings']);
    if (!previousForPending.current) {
      previousForPending.current = previous;
    }

    pendingUpdates.current = mergeSettingsUpdate(
      withSettingsDefaults({
        ...qc.getQueryData<UserSettings>(['settings']),
        ...pendingUpdates.current,
      }),
      {
        ...pendingUpdates.current,
        ...updates,
      }
    );

    qc.setQueryData(['settings'], withSettingsDefaults({
      ...previous,
      ...mergeSettingsUpdate(previous, pendingUpdates.current),
    }));

    const promise = new Promise<UserSettings>((resolve, reject) => {
      pendingResolvers.current.push({ resolve, reject });
    });

    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      void flushPending();
    }, 600);

    return promise;
  }, [flushPending, qc]);

  useEffect(() => () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
  }, []);

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
    updateSettings,
    resetSettings:  () => resetMutation.mutateAsync(),
    isSaving:       isDebouncedSaving,
    isSavingKey:    (key: keyof PartialSettings) => savingKeys.has(String(key)),
    isResetting:    resetMutation.isPending,
  };
}
