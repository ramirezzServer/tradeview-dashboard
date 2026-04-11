import { TrendingUp, TrendingDown, FlaskConical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topGainers, topLosers, trending } from '@/data/mockStockData';
import { MarketMover } from '@/types/stock';

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// Real-time market movers (top gainers/losers) require a Finnhub paid plan.
// This component renders demo/illustrative data and is clearly labelled as such.
// To make this live, integrate Finnhub Premium's /scan/technical-indicator or
// a suitable paid endpoint and replace the mock arrays below.
// ──────────────────────────────────────────────────────────────────────────────

function MoverRow({ m }: { m: MarketMover }) {
  const positive = m.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 px-2 group cursor-pointer rounded-lg hover:bg-accent/20 transition-colors">
      <div>
        <p className="text-[13px] font-semibold text-foreground">{m.symbol}</p>
        <p className="text-[9px] text-muted-foreground/40">{m.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-muted-foreground/40 tabular-nums">
          ${m.price.toFixed(2)}
        </span>
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-md ${
          positive ? 'text-bull bg-bull/8' : 'text-bear bg-bear/8'
        }`}>
          {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {positive ? '+' : ''}{m.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function MarketMovers() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="section-header text-foreground/80">Market Movers</h3>
        {/* Explicit demo badge — live movers require Finnhub paid plan */}
        <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
          <FlaskConical className="h-2.5 w-2.5" /> Demo
        </span>
      </div>
      <div className="px-4 pb-3">
        <Tabs defaultValue="gainers">
          <TabsList className="h-7 w-full bg-secondary/30 border border-border/20 rounded-lg p-0.5">
            <TabsTrigger value="gainers"  className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Gainers</TabsTrigger>
            <TabsTrigger value="losers"   className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Losers</TabsTrigger>
            <TabsTrigger value="trending" className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers"  className="mt-2 space-y-0.5">
            {topGainers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="losers"   className="mt-2 space-y-0.5">
            {topLosers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="trending" className="mt-2 space-y-0.5">
            {trending.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
