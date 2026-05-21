import { createContext, useContext, ReactNode } from 'react';
import { SETTINGS_DEFAULTS, useSettings } from '@/hooks/useSettings';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface DashboardPrefs {
  aiPredictions: boolean;
  marketMovers:  boolean;
  dailyRange:    boolean;
  volumeBars:    boolean;
}

const DashboardPrefsContext = createContext<DashboardPrefs>({
  aiPredictions: true,
  marketMovers:  true,
  dailyRange:    true,
  volumeBars:    true,
});

export function useDashboardPrefs(): DashboardPrefs {
  return useContext(DashboardPrefsContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardPrefsProvider({ children }: { children: ReactNode }) {
  const { settings, isLoading } = useSettings();
  const settingsReady = Boolean(settings) || !isLoading;
  const defaultPrefs = SETTINGS_DEFAULTS.dashboard_prefs;
  const prefs = settings?.dashboard_prefs ?? defaultPrefs;

  const value = settingsReady
    ? {
        aiPredictions: prefs.ai_predictions ?? defaultPrefs.ai_predictions ?? true,
        marketMovers:  prefs.market_movers  ?? defaultPrefs.market_movers  ?? true,
        dailyRange:    prefs.daily_range    ?? defaultPrefs.daily_range    ?? true,
        volumeBars:    prefs.volume_bars    ?? defaultPrefs.volume_bars    ?? true,
      }
    : {
        aiPredictions: false,
        marketMovers:  false,
        dailyRange:    false,
        volumeBars:    false,
      };

  return (
    <DashboardPrefsContext.Provider value={value}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}
