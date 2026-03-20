import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CandlestickChart } from '@/components/dashboard/CandlestickChart';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { AIPredictionCard } from '@/components/dashboard/AIPredictionCard';
import { MarketMovers } from '@/components/dashboard/MarketMovers';
import { DailyRangeCard } from '@/components/dashboard/DailyRangeCard';

const Index = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="p-4 lg:p-6 space-y-4 relative">
        <StatsCards />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <CandlestickChart />
            <MarketMovers />
          </div>
          <div className="space-y-4">
            <WatchlistPanel />
            <DailyRangeCard />
            <AIPredictionCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
