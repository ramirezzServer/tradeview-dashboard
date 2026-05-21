import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendingUp, TrendingDown, Activity, Gauge, BarChart3, Flame, Wifi, WifiOff } from 'lucide-react';
import { topGainers, topLosers } from '@/data/mockStockData';
import { useQuery } from '@tanstack/react-query';
import { getMarketIndices, getSectorPerformance } from '@/services/finnhub';

const sentimentIndicators = [
  { label: 'Fear & Greed', value: '68', status: 'Greed', color: 'text-bull' },
  { label: 'VIX Proxy', value: 'UVXY', status: 'ETF', color: 'text-chart-accent' },
  { label: 'Put/Call Ratio', value: '0.72', status: 'Bullish', color: 'text-bull' },
  { label: 'Advance/Decline', value: '1.84', status: 'Positive', color: 'text-bull' },
];

const MarketOverview = () => {
  const indicesQuery = useQuery({ queryKey: ['market-indices'], queryFn: getMarketIndices, staleTime: 60_000, retry: 1 });
  const sectorsQuery = useQuery({ queryKey: ['market-sectors'], queryFn: getSectorPerformance, staleTime: 60_000, retry: 1 });
  const indices = indicesQuery.data ?? [];
  const sectors = sectorsQuery.data ?? [];
  const isLive = indices.length > 0 || sectors.length > 0;

  return (
    <DashboardLayout title="Market Overview">
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className={`flex items-center gap-1.5 text-app-xs font-medium border border-border/20 rounded-md px-2 py-1 ${isLive ? 'text-bull/60' : 'text-muted-foreground/30'}`}>
            {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isLive ? 'Live ETF proxies from Finnhub' : 'Market overview unavailable'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {indices.map((idx, i) => {
            const positive = idx.changePercent >= 0;
            return (
              <div key={idx.name} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-app-xs uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{idx.name}</p>
                <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                  {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-1 text-app-sm font-semibold ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {positive ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </div>
                  <span className={`text-app-xs tabular-nums ${positive ? 'text-bull/50' : 'text-bear/50'}`}>
                    {idx.symbol} {positive ? '+' : ''}{idx.change.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Sector Performance</h2>
              </div>
              <div className="space-y-1.5">
                {sectors.map((s, i) => {
                  const positive = s.changePercent >= 0;
                  const barWidth = Math.min(Math.abs(s.changePercent) * 30, 100);
                  return (
                    <div key={s.name} className="flex items-center gap-3 py-1.5 rounded-lg hover:bg-accent/10 px-1 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                      <span className="text-app-sm text-foreground/70 w-36 shrink-0">{s.name}</span>
                      <div className="flex-1 h-4 bg-secondary/20 rounded-full overflow-hidden relative">
                        <div className={`h-full rounded-full transition-all duration-700 ${positive ? 'bg-bull/25' : 'bg-bear/25'}`} style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className={`text-app-sm font-semibold tabular-nums w-16 text-right ${positive ? 'text-bull' : 'text-bear'}`}>
                        {positive ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </span>
                      <span className="text-app-xs text-muted-foreground/30 w-10 text-right tabular-nums">{s.symbol}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-3.5 w-3.5 text-bull/70" />
                  <h2 className="section-header text-foreground/80">Top Gainers</h2>
                </div>
                <div className="space-y-0.5">
                  {topGainers.map(m => (
                    <div key={m.symbol} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/15 transition-colors">
                      <div>
                        <p className="text-app-sm font-semibold text-foreground">{m.symbol}</p>
                        <p className="text-app-xs text-muted-foreground/35">{m.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-app-sm font-bold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                        <p className="text-app-xs font-semibold text-bull tabular-nums">+{m.changePercent.toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-3.5 w-3.5 text-bear/70" />
                  <h2 className="section-header text-foreground/80">Top Losers</h2>
                </div>
                <div className="space-y-0.5">
                  {topLosers.map(m => (
                    <div key={m.symbol} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/15 transition-colors">
                      <div>
                        <p className="text-app-sm font-semibold text-foreground">{m.symbol}</p>
                        <p className="text-app-xs text-muted-foreground/35">{m.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-app-sm font-bold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                        <p className="text-app-xs font-semibold text-bear tabular-nums">{m.changePercent.toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Market Sentiment</h2>
              </div>
              <div className="space-y-2.5">
                {sentimentIndicators.map((s, i) => (
                  <div key={s.label} className="glass-card rounded-lg p-3 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-app-xs text-muted-foreground/40 uppercase tracking-[0.12em]">{s.label}</span>
                      <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md ${s.color} ${s.color === 'text-bull' ? 'bg-bull/8' : 'bg-chart-accent/8'}`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Market Status</h2>
              </div>
              <div className="space-y-3">
                {['NYSE', 'NASDAQ', 'Crypto'].map(name => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-app-sm text-muted-foreground/50">{name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-glow" />
                      <span className="text-app-xs font-semibold text-bull/80">{name === 'Crypto' ? '24/7' : 'Open'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketOverview;
