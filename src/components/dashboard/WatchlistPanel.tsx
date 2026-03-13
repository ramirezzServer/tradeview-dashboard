import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTickerSimulation } from '@/hooks/useTickerSimulation';
import { watchlistAssets } from '@/data/mockStockData';

export function WatchlistPanel() {
  const { assets, flashMap } = useTickerSimulation(watchlistAssets);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-3 pb-3">
        {assets.map(a => {
          const positive = a.changePercent >= 0;
          const flash = flashMap[a.symbol];
          return (
            <div
              key={a.symbol}
              className={`flex items-center justify-between rounded-md px-3 py-2.5 transition-colors ${flash === 'bull' ? 'flash-bull' : flash === 'bear' ? 'flash-bear' : ''}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{a.name}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {a.type === 'crypto' ? `$${a.price.toLocaleString()}` : `$${a.price.toFixed(2)}`}
                  </p>
                  <p className={`text-xs font-medium ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{a.changePercent.toFixed(2)}%
                  </p>
                </div>
                {positive ? (
                  <TrendingUp className="h-4 w-4 text-bull" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-bear" />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
