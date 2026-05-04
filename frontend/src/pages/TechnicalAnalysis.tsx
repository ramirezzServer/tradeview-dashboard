import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Activity, TrendingUp, TrendingDown, Target, Shield, Zap,
  BarChart2, ArrowUp, ArrowDown, Wifi, WifiOff, RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useIndicators } from '@/hooks/useIndicators';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';

type Timeframe = '1W' | '1M' | '3M';
const SYMBOL = 'AAPL';

// ─── Provider error messages ──────────────────────────────────────────────────
function ProviderNotice({ error }: { error: string | null }) {
  if (!error) return null;
  const messages: Record<string, string> = {
    PLAN_RESTRICTION: 'Finnhub candle data requires a paid plan. Falling back to Alpha Vantage.',
    AV_RATE_LIMITED:  'Alpha Vantage daily quota reached (25 req/day free tier). Chart data unavailable until quota resets.',
    AV_NOT_CONFIGURED: 'Alpha Vantage key not configured (ALPHA_VANTAGE_KEY). Set it in backend .env.',
    FINNHUB_KEY_MISSING: 'Finnhub API key not configured on the server.',
    NO_DATA:          'No candle data available for the selected timeframe.',
  };
  const msg = messages[error] ?? `Chart data unavailable (${error})`;
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-chart-accent/8 border border-chart-accent/15 text-[10px] text-muted-foreground/60">
      <WifiOff className="h-3 w-3 text-chart-accent/60 shrink-0" />
      {msg}
    </div>
  );
}

const TechnicalAnalysis = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const { indicators, loading, error, provider, isLive } = useIndicators(SYMBOL, timeframe);

  const p = indicators?.currentPrice ?? 0;
  const fmt = (v: number | null) => v !== null ? `$${v.toFixed(2)}` : '—';

  // Moving average rows
  const maRows = indicators ? [
    { name: 'SMA (10)',  value: fmt(indicators.sma10),  signal: indicators.sma10  !== null ? (p > indicators.sma10  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.sma10  !== null && p > indicators.sma10 },
    { name: 'SMA (20)',  value: fmt(indicators.sma20),  signal: indicators.sma20  !== null ? (p > indicators.sma20  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.sma20  !== null && p > indicators.sma20 },
    { name: 'SMA (50)',  value: fmt(indicators.sma50),  signal: indicators.sma50  !== null ? (p > indicators.sma50  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.sma50  !== null && p > indicators.sma50 },
    { name: 'SMA (100)', value: fmt(indicators.sma100), signal: indicators.sma100 !== null ? (p > indicators.sma100 ? 'Buy' : 'Sell') : 'N/A', positive: indicators.sma100 !== null && p > indicators.sma100 },
    { name: 'SMA (200)', value: fmt(indicators.sma200), signal: indicators.sma200 !== null ? (p > indicators.sma200 ? 'Buy' : 'Sell') : 'N/A', positive: indicators.sma200 !== null && p > indicators.sma200 },
    { name: 'EMA (10)',  value: fmt(indicators.ema10),  signal: indicators.ema10  !== null ? (p > indicators.ema10  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.ema10  !== null && p > indicators.ema10 },
    { name: 'EMA (20)',  value: fmt(indicators.ema20),  signal: indicators.ema20  !== null ? (p > indicators.ema20  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.ema20  !== null && p > indicators.ema20 },
    { name: 'EMA (50)',  value: fmt(indicators.ema50),  signal: indicators.ema50  !== null ? (p > indicators.ema50  ? 'Buy' : 'Sell') : 'N/A', positive: indicators.ema50  !== null && p > indicators.ema50 },
  ] : [];

  // Oscillator rows
  const oscRows = indicators ? [
    {
      name: 'RSI (14)',
      value: indicators.rsiValue !== null ? indicators.rsiValue.toFixed(1) : '—',
      signal: indicators.rsiSignal.signal,
      color:  indicators.rsiSignal.color,
      desc: 'Relative Strength Index',
    },
    {
      name: 'MACD (12,26,9)',
      value: indicators.macdResult !== null ? indicators.macdResult.macdLine.toFixed(3) : '—',
      signal: indicators.macdSignal.signal,
      color:  indicators.macdSignal.color,
      desc: 'Moving Average Convergence',
    },
    {
      name: 'MACD Histogram',
      value: indicators.macdResult !== null ? indicators.macdResult.histogram.toFixed(3) : '—',
      signal: indicators.macdResult ? (indicators.macdResult.histogram > 0 ? 'Rising' : 'Falling') : 'N/A',
      color:  indicators.macdResult ? (indicators.macdResult.histogram > 0 ? 'text-bull' : 'text-bear') : 'text-muted-foreground',
      desc: 'MACD Signal Cross',
    },
    {
      name: 'BB Upper',
      value: indicators.bbands !== null ? `$${indicators.bbands.upper.toFixed(2)}` : '—',
      signal: indicators.bbands !== null ? (p > indicators.bbands.upper ? 'Overbought' : 'Normal') : 'N/A',
      color:  indicators.bbands !== null && p > indicators.bbands.upper ? 'text-bear' : 'text-chart-accent',
      desc: 'Bollinger Upper Band',
    },
    {
      name: 'BB Middle (SMA20)',
      value: indicators.bbands !== null ? `$${indicators.bbands.middle.toFixed(2)}` : '—',
      signal: indicators.bbands !== null ? (p > indicators.bbands.middle ? 'Above' : 'Below') : 'N/A',
      color:  indicators.bbands !== null ? (p > indicators.bbands.middle ? 'text-bull' : 'text-bear') : 'text-muted-foreground',
      desc: 'Bollinger Middle Band',
    },
    {
      name: 'BB Lower',
      value: indicators.bbands !== null ? `$${indicators.bbands.lower.toFixed(2)}` : '—',
      signal: indicators.bbands !== null ? (p < indicators.bbands.lower ? 'Oversold' : 'Normal') : 'N/A',
      color:  indicators.bbands !== null && p < indicators.bbands.lower ? 'text-bull' : 'text-chart-accent',
      desc: 'Bollinger Lower Band',
    },
  ] : [];

  const pivots = indicators?.pivots;

  // Overall signal
  const buyCount     = indicators?.buyCount     ?? 0;
  const sellCount    = indicators?.sellCount    ?? 0;
  const neutralCount = indicators?.neutralCount ?? 0;
  const totalSignals = buyCount + sellCount + neutralCount;
  const overallSignal = buyCount > sellCount * 1.5
    ? { label: 'Strong Buy',  color: 'text-bull value-bull' }
    : buyCount > sellCount
    ? { label: 'Buy',         color: 'text-bull' }
    : sellCount > buyCount * 1.5
    ? { label: 'Strong Sell', color: 'text-bear' }
    : sellCount > buyCount
    ? { label: 'Sell',        color: 'text-bear' }
    : { label: 'Neutral',     color: 'text-chart-accent' };

  return (
    <DashboardLayout title="Technical Analysis">
      <div className="p-4 lg:p-6 space-y-4">

        {/* Header bar — live/demo + timeframe selector + freshness */}
        <div className="flex items-center gap-3 px-1 flex-wrap">
          {loading ? (
            <Skeleton className="h-4 w-32 bg-secondary/20 rounded" />
          ) : isLive ? (
            <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
              <Wifi className="h-2.5 w-2.5" /> Live · {provider === 'finnhub' ? 'Finnhub' : 'Alpha Vantage'} — {SYMBOL}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
              <WifiOff className="h-2.5 w-2.5" /> Candles unavailable
            </span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {(['1W', '1M', '3M'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-primary/12 text-primary border border-primary/15'
                    : 'text-muted-foreground/40 hover:text-foreground border border-transparent'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Provider error notice */}
        {!loading && <ProviderNotice error={error} />}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-secondary/20" />)
          ) : (
            [
              { label: 'Overall Signal', value: overallSignal.label, icon: TrendingUp, color: overallSignal.color },
              {
                label: 'RSI (14)', value: indicators?.rsiValue != null ? indicators!.rsiValue!.toFixed(1) : '—',
                icon: Activity, color: indicators?.rsiSignal.color ?? 'text-muted-foreground',
              },
              {
                label: 'Support (BB Low)', value: indicators?.bbands ? `$${indicators.bbands.lower.toFixed(2)}` : '—',
                icon: Shield, color: 'text-chart-accent',
              },
              {
                label: 'Resistance (BB Up)', value: indicators?.bbands ? `$${indicators.bbands.upper.toFixed(2)}` : '—',
                icon: Target, color: 'text-chart-accent',
              },
            ].map((c, i) => (
              <div key={c.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{c.label}</p>
                  <c.icon className={`h-3.5 w-3.5 ${c.color.split(' ')[0]}/70`} />
                </div>
                <p className={`text-[15px] font-bold mt-2 ${c.color}`}>{c.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Signal summary bar */}
        {!loading && isLive && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Signal Summary — {SYMBOL}</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Buy',     count: buyCount,     color: 'text-bull',         bg: 'bg-bull/8' },
                { label: 'Neutral', count: neutralCount,  color: 'text-chart-accent', bg: 'bg-chart-accent/8' },
                { label: 'Sell',    count: sellCount,    color: 'text-bear',         bg: 'bg-bear/8' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/15 border border-border/10">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {totalSignals > 0 && (
              <div className="flex h-1.5 rounded-full overflow-hidden">
                <div className="bg-bull/70 transition-all" style={{ width: `${(buyCount / totalSignals) * 100}%` }} />
                <div className="bg-chart-accent/50 transition-all" style={{ width: `${(neutralCount / totalSignals) * 100}%` }} />
                <div className="bg-bear/70 transition-all" style={{ width: `${(sellCount / totalSignals) * 100}%` }} />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            {/* Trend Chart */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Price & Moving Averages</h2>
                {isLive && indicators?.lastDate && (
                  <span className="ml-auto text-[8px] text-muted-foreground/30">
                    As of {indicators.lastDate}
                  </span>
                )}
              </div>
              {loading ? (
                <Skeleton className="h-56 w-full rounded-lg bg-secondary/20" />
              ) : indicators?.chartData.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={indicators.chartData}>
                      <defs>
                        <linearGradient id="taPriceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false}
                        tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']}
                        tickFormatter={v => `$${v.toFixed(0)}`} width={45} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11, boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.5)' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === 'price' ? 'Price' : name === 'ma20' ? 'SMA 20' : 'SMA 50']}
                      />
                      <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#taPriceGrad)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="ma20" stroke="hsl(var(--bull))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} connectNulls />
                      <Area type="monotone" dataKey="ma50" stroke="hsl(var(--bear))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-[11px] text-muted-foreground/30">
                  Insufficient data for chart
                </div>
              )}
              <div className="flex items-center gap-5 mt-3 justify-center">
                <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-primary rounded" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">Price</span></div>
                <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-bull rounded" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">SMA20</span></div>
                <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-bear rounded" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">SMA50</span></div>
              </div>
            </div>

            {/* Oscillators */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Oscillators & Indicators</h2>
                {isLive && (
                  <span className="ml-auto flex items-center gap-1 text-[8px] text-bull/60">
                    <Wifi className="h-2.5 w-2.5" /> Calculated from live candles
                  </span>
                )}
              </div>
              {loading ? (
                <div className="space-y-1">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg bg-secondary/20" />)}
                </div>
              ) : oscRows.length > 0 ? (
                <div className="space-y-0.5">
                  {oscRows.map((ind, i) => (
                    <div key={ind.name} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-accent/10 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                      <div>
                        <span className="text-[13px] text-foreground">{ind.name}</span>
                        <p className="text-[8px] text-muted-foreground/30 tracking-wider">{ind.desc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-bold text-foreground tabular-nums">{ind.value}</span>
                        <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${ind.color} ${
                          ind.color === 'text-bull' ? 'bg-bull/8' : ind.color === 'text-bear' ? 'bg-bear/8' : 'bg-chart-accent/8'
                        }`}>{ind.signal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground/30 text-center py-4">
                  Insufficient candle data for indicator calculations
                </p>
              )}
            </div>

            {/* Moving Averages */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Moving Averages</h2>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg bg-secondary/20" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                  {maRows.map(ma => (
                    <div key={ma.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/10 transition-colors">
                      <span className="text-[11px] text-foreground/70">{ma.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-foreground tabular-nums">{ma.value}</span>
                        {ma.signal !== 'N/A' ? (
                          <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${ma.positive ? 'text-bull' : 'text-bear'}`}>
                            {ma.positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                            {ma.signal}
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground/30">N/A</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {maRows.length === 0 && (
                    <p className="col-span-2 text-[11px] text-muted-foreground/30 text-center py-2">
                      Need more candle history for MA(200). Try 3M timeframe.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pivot Points */}
          <div className="glass-card rounded-xl p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Pivot Points</h2>
              {isLive && (
                <span className="ml-auto flex items-center gap-1 text-[8px] text-bull/60">
                  <Wifi className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
            {loading ? (
              <div className="space-y-1">
                {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-9 rounded-lg bg-secondary/20" />)}
              </div>
            ) : pivots ? (
              <div className="space-y-1">
                {[
                  { label: 'R3',    value: pivots.R3 },
                  { label: 'R2',    value: pivots.R2 },
                  { label: 'R1',    value: pivots.R1 },
                  { label: 'Pivot', value: pivots.Pivot, highlight: true },
                  { label: 'S1',    value: pivots.S1 },
                  { label: 'S2',    value: pivots.S2 },
                  { label: 'S3',    value: pivots.S3 },
                ].map(p => (
                  <div
                    key={p.label}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                      p.highlight ? 'bg-primary/8 border border-primary/15 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.15)]' : 'hover:bg-accent/10'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${
                      p.label.startsWith('R') ? 'text-bear/80' : p.label.startsWith('S') ? 'text-bull/80' : 'text-primary'
                    }`}>{p.label}</span>
                    <span className="text-[13px] font-bold text-foreground tabular-nums">${p.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/30 text-center py-4">
                Pivot data requires candle history
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicalAnalysis;
