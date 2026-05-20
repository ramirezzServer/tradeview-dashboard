import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

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
  const { settings } = useSettings();
  const prefs = settings?.dashboard_prefs ?? {};

  return (
    <DashboardPrefsContext.Provider value={{
      aiPredictions: prefs.ai_predictions ?? true,
      marketMovers:  prefs.market_movers  ?? true,
      dailyRange:    prefs.daily_range    ?? true,
      volumeBars:    prefs.volume_bars    ?? true,
    }}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}
