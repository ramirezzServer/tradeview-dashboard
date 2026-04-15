import { TrendingUp, TrendingDown, FlaskConical, Wifi, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { topGainers, topLosers, trending } from '@/data/mockStockData';
import { MarketMover } from '@/types/stock';
import { useMarketMovers, LiveMover } from '@/hooks/useMarketMovers';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';

// ─── Row renderers ─────────────────────────────────────────────────────────────

function LiveMoverRow({ m }: { m: LiveMover }) {
  const positive = m.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 px-2 group cursor-pointer rounded-lg hover:bg-accent/20 transition-colors">
      <div>
        <p className="text-[13px] font-semibold text-foreground">{m.symbol}</p>
        <p className="text-[9px] text-muted-foreground/40 tabular-nums">
          Vol {m.volume >= 1_000_000 ? `${(m.volume / 1_000_000).toFixed(1)}M` : `${(m.volume / 1_000).toFixed(0)}K`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-muted-foreground/60 tabular-nums">
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

function DemoMoverRow({ m }: { m: MarketMover }) {
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

function LoadingRows() {
  return (
    <div className="space-y-1 mt-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-lg bg-secondary/20" />
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function MarketMovers() {
  const { data, isLoading, isLive, error, fetchedAt } = useMarketMovers();

  const gainers  = data?.topGainers  ?? [];
  const losers   = data?.topLosers   ?? [];
  const trending = data?.mostActive  ?? [];

  // Rate-limit / not-configured: show informative notice above demo fallback
  const showQuotaNotice = !isLoading && !isLive && error === 'RATE_LIMITED';
  const showConfigNotice = !isLoading && !isLive && error === 'AV_NOT_CONFIGURED';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="section-header text-foreground/80">Market Movers</h3>
        <div className="flex items-center gap-2">
          {isLoading ? null : isLive ? (
            <>
              <FreshnessBadge fetchedAt={fetchedAt} />
              <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
                <Wifi className="h-2.5 w-2.5" /> Live · AV
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
              <FlaskConical className="h-2.5 w-2.5" /> Demo
            </span>
          )}
        </div>
      </div>

      {/* Quota / config notice */}
      {(showQuotaNotice || showConfigNotice) && (
        <div className="mx-4 mb-2 flex items-start gap-1.5 p-2 rounded-lg bg-chart-accent/8 border border-chart-accent/15">
          <AlertCircle className="h-3 w-3 text-chart-accent/60 mt-0.5 shrink-0" />
          <p className="text-[8px] text-muted-foreground/50 leading-snug">
            {showQuotaNotice
              ? 'Alpha Vantage daily quota reached. Showing recent demo data. Resets at midnight UTC.'
              : 'Alpha Vantage key not configured (ALPHA_VANTAGE_KEY). Showing demo data.'}
          </p>
        </div>
      )}

      <div className="px-4 pb-3">
        <Tabs defaultValue="gainers">
          <TabsList className="h-7 w-full bg-secondary/30 border border-border/20 rounded-lg p-0.5">
            <TabsTrigger value="gainers"  className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Gainers</TabsTrigger>
            <TabsTrigger value="losers"   className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Losers</TabsTrigger>
            <TabsTrigger value="trending" className="text-[10px] flex-1 rounded-md data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]">Active</TabsTrigger>
          </TabsList>

          {/* Gainers */}
          <TabsContent value="gainers" className="mt-2 space-y-0.5">
            {isLoading ? <LoadingRows /> : isLive && gainers.length > 0
              ? gainers.slice(0, 5).map(m => <LiveMoverRow key={m.symbol} m={m} />)
              : topGainers.map(m => <DemoMoverRow key={m.symbol} m={m} />)}
          </TabsContent>

          {/* Losers */}
          <TabsContent value="losers" className="mt-2 space-y-0.5">
            {isLoading ? <LoadingRows /> : isLive && losers.length > 0
              ? losers.slice(0, 5).map(m => <LiveMoverRow key={m.symbol} m={m} />)
              : topLosers.map(m => <DemoMoverRow key={m.symbol} m={m} />)}
          </TabsContent>

          {/* Most active */}
          <TabsContent value="trending" className="mt-2 space-y-0.5">
            {isLoading ? <LoadingRows /> : isLive && trending.length > 0
              ? trending.slice(0, 5).map(m => <LiveMoverRow key={m.symbol} m={m} />)
              : topLosers.map(m => <DemoMoverRow key={m.symbol} m={m} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
