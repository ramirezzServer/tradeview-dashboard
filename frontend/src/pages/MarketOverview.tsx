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
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{idx.name}</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{idx.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${idx.positive ? 'text-bull' : 'text-bear'}`}>
                {idx.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {idx.change}
              </div>
              <span className={`text-[9px] tabular-nums ${idx.positive ? 'text-bull/50' : 'text-bear/50'}`}>{idx.points}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Sector Performance */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Sector Performance</h2>
            </div>
            <div className="space-y-1.5">
              {sectors.map((s, i) => {
                const positive = s.change >= 0;
                const barWidth = Math.min(Math.abs(s.change) * 30, 100);
                return (
                  <div key={s.name} className="flex items-center gap-3 py-1.5 rounded-lg hover:bg-accent/10 px-1 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <span className="text-[11px] text-foreground/70 w-28 shrink-0">{s.name}</span>
                    <div className="flex-1 h-4 bg-secondary/20 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${positive ? 'bg-bull/25' : 'bg-bear/25'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold tabular-nums w-14 text-right ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{s.change.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-muted-foreground/30 w-12 text-right tabular-nums">{s.weight}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Movers */}
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
                      <p className="text-[13px] font-semibold text-foreground">{m.symbol}</p>
                      <p className="text-[9px] text-muted-foreground/35">{m.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                      <p className="text-[10px] font-semibold text-bull tabular-nums">+{m.changePercent.toFixed(2)}%</p>
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
                      <p className="text-[13px] font-semibold text-foreground">{m.symbol}</p>
                      <p className="text-[9px] text-muted-foreground/35">{m.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-foreground tabular-nums">${m.price.toFixed(2)}</p>
                      <p className="text-[10px] font-semibold text-bear tabular-nums">{m.changePercent.toFixed(2)}%</p>
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
              <Gauge className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Market Sentiment</h2>
            </div>
            <div className="space-y-2.5">
              {sentimentIndicators.map((s, i) => (
                <div key={s.label} className="glass-card rounded-lg p-3 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.12em]">{s.label}</span>
                    <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md ${s.color} ${s.color === 'text-bull' ? 'bg-bull/8' : 'bg-bear/8'}`}>
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
              {[
                { name: 'NYSE', status: 'Open' },
                { name: 'NASDAQ', status: 'Open' },
                { name: 'Crypto', status: '24/7' },
              ].map(m => (
                <div key={m.name} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/50">{m.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-glow" />
                    <span className="text-[9px] font-semibold text-bull/80">{m.status}</span>
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

export default MarketOverview;
