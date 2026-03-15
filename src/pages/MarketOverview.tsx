import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Globe, TrendingUp, TrendingDown, Activity, Gauge, BarChart3, Flame } from 'lucide-react';
import { topGainers, topLosers } from '@/data/mockStockData';

const indices = [
  { name: 'S&P 500', value: '5,234.18', change: '+0.82%', positive: true, points: '+42.68' },
  { name: 'NASDAQ', value: '16,428.82', change: '+1.24%', positive: true, points: '+201.34' },
  { name: 'DOW 30', value: '39,512.84', change: '-0.14%', positive: false, points: '-55.42' },
  { name: 'Russell 2000', value: '2,089.42', change: '+0.56%', positive: true, points: '+11.64' },
];

const sectors = [
  { name: 'Technology', change: 1.42, weight: '28.5%' },
  { name: 'Healthcare', change: 0.38, weight: '13.2%' },
  { name: 'Financials', change: -0.22, weight: '12.8%' },
  { name: 'Energy', change: -0.91, weight: '7.6%' },
  { name: 'Consumer Disc.', change: 0.67, weight: '10.4%' },
  { name: 'Industrials', change: 0.15, weight: '8.9%' },
  { name: 'Comm. Services', change: 1.05, weight: '6.8%' },
  { name: 'Utilities', change: -0.34, weight: '4.2%' },
];

const sentimentIndicators = [
  { label: 'Fear & Greed', value: '68', status: 'Greed', color: 'text-bull' },
  { label: 'VIX', value: '14.82', status: 'Low Vol', color: 'text-bull' },
  { label: 'Put/Call Ratio', value: '0.72', status: 'Bullish', color: 'text-bull' },
  { label: 'Advance/Decline', value: '1.84', status: 'Positive', color: 'text-bull' },
];

const MarketOverview = () => (
  <DashboardLayout title="Market Overview">
    <div className="p-4 lg:p-6 space-y-4">
      {/* Indices */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {indices.map((idx, i) => (
          <div key={idx.name} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{idx.name}</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{idx.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 text-xs font-semibold ${idx.positive ? 'text-bull' : 'text-bear'}`}>
                {idx.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {idx.change}
              </div>
              <span className={`text-[10px] tabular-nums ${idx.positive ? 'text-bull/60' : 'text-bear/60'}`}>{idx.points}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Sector Performance */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Sector Performance</h2>
            </div>
            <div className="space-y-2">
              {sectors.map((s, i) => {
                const positive = s.change >= 0;
                const barWidth = Math.min(Math.abs(s.change) * 30, 100);
                return (
                  <div key={s.name} className="flex items-center gap-3 py-1.5 animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <span className="text-xs text-foreground w-28 shrink-0">{s.name}</span>
                    <div className="flex-1 h-5 bg-secondary/30 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${positive ? 'bg-bull/30' : 'bg-bear/30'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums w-14 text-right ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{s.change.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 w-12 text-right tabular-nums">{s.weight}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-bull" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Top Gainers</h2>
              </div>
              <div className="space-y-1">
                {topGainers.map(m => (
                  <div key={m.symbol} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/20 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.symbol}</p>
                      <p className="text-[9px] text-muted-foreground/50">{m.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                      <p className="text-[11px] font-semibold text-bull tabular-nums">+{m.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-bear" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Top Losers</h2>
              </div>
              <div className="space-y-1">
                {topLosers.map(m => (
                  <div key={m.symbol} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/20 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.symbol}</p>
                      <p className="text-[9px] text-muted-foreground/50">{m.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                      <p className="text-[11px] font-semibold text-bear tabular-nums">{m.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sentiment */}
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Market Sentiment</h2>
            </div>
            <div className="space-y-3">
              {sentimentIndicators.map((s, i) => (
                <div key={s.label} className="glass-card rounded-lg p-3 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{s.label}</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${s.color} ${s.color === 'text-bull' ? 'bg-bull/10' : 'bg-bear/10'}`}>
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
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Market Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">NYSE</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-bull animate-pulse" />
                  <span className="text-[10px] font-semibold text-bull">Open</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">NASDAQ</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-bull animate-pulse" />
                  <span className="text-[10px] font-semibold text-bull">Open</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">Crypto</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-bull animate-pulse" />
                  <span className="text-[10px] font-semibold text-bull">24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default MarketOverview;
