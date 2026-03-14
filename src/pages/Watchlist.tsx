import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { useTickerSimulation } from '@/hooks/useTickerSimulation';
import { watchlistAssets } from '@/data/mockStockData';

const Watchlist = () => {
  const { assets, flashMap } = useTickerSimulation(watchlistAssets);

  return (
    <DashboardLayout title="Watchlist">
      <div className="p-4 lg:p-6 space-y-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Active Watchlist</h2>
              <p className="text-[10px] text-muted-foreground/60">{assets.length} assets tracked</p>
            </div>
          </div>
          <div className="divide-y divide-border/20">
            {assets.map(a => {
              const positive = a.changePercent >= 0;
              const flash = flashMap[a.symbol];
              return (
                <div
                  key={a.symbol}
                  className={`flex items-center justify-between py-3 px-2 rounded-lg transition-all duration-200 hover:bg-accent/30 ${
                    flash === 'bull' ? 'flash-bull' : flash === 'bear' ? 'flash-bear' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-foreground">{a.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.symbol}</p>
                      <p className="text-[10px] text-muted-foreground/60">{a.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        ${a.type === 'crypto' ? a.price.toLocaleString() : a.price.toFixed(2)}
                      </p>
                      <p className={`text-[11px] font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                        {positive ? '+' : ''}{a.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className={`flex items-center justify-center h-6 w-6 rounded-md ${positive ? 'bg-bull/10' : 'bg-bear/10'}`}>
                      {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
