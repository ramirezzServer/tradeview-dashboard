import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CandlestickChart } from '@/components/dashboard/CandlestickChart';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { AIPredictionCard } from '@/components/dashboard/AIPredictionCard';
import { MarketMovers } from '@/components/dashboard/MarketMovers';
import { DailyRangeCard } from '@/components/dashboard/DailyRangeCard';
import { useDashboardPrefs } from '@/context/DashboardPrefsContext';
import { SETTINGS_DEFAULTS, useSettings } from '@/hooks/useSettings';

const Index = () => {
  const { aiPredictions, marketMovers, dailyRange } = useDashboardPrefs();
  const { settings } = useSettings();
  const dashboardSymbol = (settings?.default_symbol ?? SETTINGS_DEFAULTS.default_symbol ?? 'AAPL').toUpperCase();

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-4 lg:p-6 space-y-4 relative">
        <StatsCards symbol={dashboardSymbol} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <CandlestickChart symbol={dashboardSymbol} />
            {marketMovers && <MarketMovers />}
          </div>
          <div className="space-y-4">
            <WatchlistPanel />
            {dailyRange    && <DailyRangeCard symbol={dashboardSymbol} />}
            {aiPredictions && <AIPredictionCard symbol={dashboardSymbol} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
