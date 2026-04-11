import { useMemo, useState } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { OHLCVData } from '@/types/stock';
import { useFinnhubCandles } from '@/hooks/useFinnhubCandles';
import { Skeleton } from '@/components/ui/skeleton';
import { Wifi, WifiOff, Lock, AlertCircle, RefreshCw } from 'lucide-react';

type Timeframe = '1W' | '1M' | '3M';
const TIMEFRAMES: Timeframe[] = ['1W', '1M', '3M'];

interface CandleData extends OHLCVData {
  fill:        string;
  wickHigh:    number;
  wickLow:     number;
  bodyBottom:  number;
  bodyHeight:  number;
}

interface TooltipProps { active?: boolean; payload?: { payload: CandleData }[] }
function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-lg p-3 text-xs shadow-2xl">
      <p className="mb-2 font-bold text-foreground text-[13px]">{d.date}</p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {(['Open', 'High', 'Low', 'Close'] as const).map(label => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground/50 text-[10px] uppercase tracking-wider">{label}</span>
            <span className="text-foreground font-semibold tabular-nums">
              ${(d[label.toLowerCase() as keyof OHLCVData] as number).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="col-span-2 flex items-center justify-between gap-3 pt-1 border-t border-border/20">
          <span className="text-muted-foreground/50 text-[10px] uppercase tracking-wider">Volume</span>
          <span className="text-foreground font-semibold tabular-nums">{(d.volume / 1e6).toFixed(1)}M</span>
        </div>
      </div>
    </div>
  );
}

// ─── Error / empty states ─────────────────────────────────────────────────────

function ChartPlaceholder({
  icon: Icon,
  title,
  body,
  onRetry,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[380px] gap-3 text-center px-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30 border border-border/20">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground/60">{title}</p>
        <p className="text-[11px] text-muted-foreground/35 mt-1 max-w-xs">{body}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11px] text-primary/60 hover:text-primary transition-colors mt-1"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function CandlestickChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [retryKey, setRetryKey]   = useState(0);

  const { data: liveData, loading, error, isLive, provider } = useFinnhubCandles('AAPL', timeframe);

  // Retry by changing the key so the parent re-mounts the hook's effect
  const retry = () => setRetryKey(k => k + 1);

  // ── Error routing ──────────────────────────────────────────────────────────
  const isPlanRestriction = error === 'PLAN_RESTRICTION' || error === 'ACCESS_FORBIDDEN';
  const isAvRateLimited   = error === 'AV_RATE_LIMITED';
  const isNoData          = error === 'NO_DATA';
  const isOtherError      = !!error && !isPlanRestriction && !isNoData && !isAvRateLimited;

  const { chartData, minPrice, maxPrice } = useMemo(() => {
    const raw    = liveData;
    if (!raw.length) return { chartData: [], minPrice: 0, maxPrice: 0 };
    const prices = raw.flatMap(d => [d.low, d.high]);
    const min    = Math.floor(Math.min(...prices) - 2);
    const max    = Math.ceil(Math.max(...prices) + 2);
    const mapped: CandleData[] = raw.map(d => {
      const bullish = d.close >= d.open;
      return {
        ...d,
        fill:       bullish ? 'hsl(152, 69%, 46%)' : 'hsl(0, 72%, 51%)',
        wickHigh:   d.high,
        wickLow:    d.low,
        bodyBottom: Math.min(d.open, d.close),
        bodyHeight: Math.abs(d.close - d.open) || 0.01,
      };
    });
    return { chartData: mapped, minPrice: min, maxPrice: max };
  }, [liveData, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass-card rounded-xl overflow-hidden gradient-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground tracking-tight">AAPL — Apple Inc.</h2>
            {loading ? (
              <span className="text-[8px] text-muted-foreground/30 font-medium">Loading…</span>
            ) : isLive ? (
              <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
                <Wifi className="h-2.5 w-2.5" />
                {provider === 'alphavantage' ? 'Alpha Vantage' : 'Live'}
              </span>
            ) : isPlanRestriction ? (
              <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
                <Lock className="h-2.5 w-2.5" /> Paid plan required
              </span>
            ) : isAvRateLimited ? (
              <span className="flex items-center gap-1 text-[8px] text-bear/40 font-medium">
                <AlertCircle className="h-2.5 w-2.5" /> Rate limited
              </span>
            ) : isOtherError ? (
              <span className="flex items-center gap-1 text-[8px] text-bear/40 font-medium">
                <AlertCircle className="h-2.5 w-2.5" /> Error
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
                <WifiOff className="h-2.5 w-2.5" /> No data
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5 tracking-wider">NASDAQ · Candlestick</p>
        </div>
        <div className="flex gap-0.5 bg-secondary/30 rounded-lg p-0.5 border border-border/20">
          {TIMEFRAMES.map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-[10px] font-semibold rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-primary/15 text-primary shadow-[0_0_8px_-2px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground/50 hover:text-foreground'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-2 pb-1">
        {/* Loading skeleton */}
        {loading && (
          <div className="flex items-center justify-center h-[380px]">
            <Skeleton className="h-[360px] w-full bg-secondary/20 rounded-lg" />
          </div>
        )}

        {/* Plan restriction — no fallback fake data */}
        {!loading && isPlanRestriction && (
          <ChartPlaceholder
            icon={Lock}
            title="Candle data requires a paid Finnhub plan"
            body="Historical OHLCV candles are not available on the Finnhub free tier. Upgrade your Finnhub plan or switch to a provider that supports candle data on the free tier."
          />
        )}

        {/* No data returned */}
        {!loading && isNoData && (
          <ChartPlaceholder
            icon={AlertCircle}
            title="No candle data available"
            body="Finnhub returned no candle data for this symbol and timeframe. Try a different timeframe or check that the market is open."
            onRetry={retry}
          />
        )}

        {/* Alpha Vantage rate limit */}
        {!loading && isAvRateLimited && (
          <ChartPlaceholder
            icon={AlertCircle}
            title="Alternative provider rate-limited"
            body="Alpha Vantage free tier allows 25 requests/day. Quota reached — chart data will be available again tomorrow."
            onRetry={retry}
          />
        )}

        {/* Other error */}
        {!loading && isOtherError && (
          <ChartPlaceholder
            icon={AlertCircle}
            title="Could not load chart"
            body={`Data fetch failed: ${error}. Check your network and backend configuration.`}
            onRetry={retry}
          />
        )}

        {/* Live chart — only rendered when we have real data */}
        {!loading && isLive && chartData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 8%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.slice(5)}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${v}`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(228, 18%, 6%)' }} />
                <Bar dataKey="wickHigh" barSize={1} fillOpacity={0.6}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
                <Bar dataKey="bodyHeight" barSize={8} fillOpacity={0.9}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={50}>
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Bar dataKey="volume" barSize={6} fillOpacity={0.25}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
