import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTickerSimulation } from '@/hooks/useTickerSimulation';
import { watchlistAssets } from '@/data/mockStockData';

export function WatchlistPanel() {
  const { assets, flashMap } = useTickerSimulation(watchlistAssets);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Watchlist</h3>
      </div>
      <div className="px-2 pb-2 space-y-0.5">
        {assets.map(a => {
          const positive = a.changePercent >= 0;
          const flash = flashMap[a.symbol];
          return (
            <div
              key={a.symbol}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-accent/40 cursor-pointer ${
                flash === 'bull' ? 'flash-bull' : flash === 'bear' ? 'flash-bear' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.symbol}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate">{a.name}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {a.type === 'crypto' ? `$${a.price.toLocaleString()}` : `$${a.price.toFixed(2)}`}
                  </p>
                  <p className={`text-[11px] font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{a.changePercent.toFixed(2)}%
                  </p>
                </div>
                {positive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-bull opacity-60" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-bear opacity-60" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
