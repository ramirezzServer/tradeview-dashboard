import { TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topGainers, topLosers, trending } from '@/data/mockStockData';
import { MarketMover } from '@/types/stock';

function MoverRow({ m }: { m: MarketMover }) {
  const positive = m.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 px-1 group cursor-pointer">
      <div>
        <p className="text-sm font-semibold text-foreground">{m.symbol}</p>
        <p className="text-[10px] text-muted-foreground/60">{m.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground tabular-nums">${m.price.toFixed(2)}</span>
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
          positive
            ? 'text-bull bg-bull/10'
            : 'text-bear bg-bear/10'
        }`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? '+' : ''}{m.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function MarketMovers() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Market Movers</h3>
      </div>
      <div className="px-4 pb-3">
        <Tabs defaultValue="gainers">
          <TabsList className="h-7 w-full bg-secondary/40 border border-border/30 rounded-lg p-0.5">
            <TabsTrigger value="gainers" className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Losers</TabsTrigger>
            <TabsTrigger value="trending" className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-2 divide-y divide-border/30">
            {topGainers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="losers" className="mt-2 divide-y divide-border/30">
            {topLosers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="trending" className="mt-2 divide-y divide-border/30">
            {trending.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
