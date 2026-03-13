import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Header } from '@/components/dashboard/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CandlestickChart } from '@/components/dashboard/CandlestickChart';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { AIPredictionCard } from '@/components/dashboard/AIPredictionCard';
import { MarketMovers } from '@/components/dashboard/MarketMovers';

const Index = () => {
  return (
    <div className="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto p-4 lg:p-6 space-y-4">
              <StatsCards />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <CandlestickChart />
                  <MarketMovers />
                </div>
                <div className="space-y-4">
                  <WatchlistPanel />
                  <AIPredictionCard />
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
