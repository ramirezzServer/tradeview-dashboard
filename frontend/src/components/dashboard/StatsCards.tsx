import { DollarSign, TrendingUp, BarChart2, Building2, Activity, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useMarketQuote } from '@/hooks/useMarketQuote';
import { useFinnhubProfile } from '@/hooks/useFinnhubProfile';
import { Skeleton } from '@/components/ui/skeleton';

const SYMBOL = 'AAPL';

const formatLarge = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
};

export function StatsCards() {
  // Shared React Query cache — DailyRangeCard uses the same queryKey ['quote', 'AAPL']
  // so both components share one request.
  const { data: quote, isLoading: quoteLoading, isLive } = useMarketQuote(SYMBOL);

  // Profile gives us 52-week range, market cap (from financials metric)
  const { data: profileData, loading: profileLoading } = useFinnhubProfile(SYMBOL);
  const metrics = profileData?.metrics ?? {};
  const profile = profileData?.profile ?? null;

  const loading = quoteLoading || profileLoading;

  // ── Build display values, falling back gracefully ───────────────────────────
  const currentPrice = quote?.c ?? 0;
  const dailyChange  = quote?.d ?? 0;
  const dailyChangePct = quote?.dp ?? 0;

  // Volume not available from /quote — Finnhub free plan omits it.
  // Only show if we have it from the financials metric endpoint.
  const avgVolume10d = metrics['10DayAverageTradingVolume']
    ? `${(metrics['10DayAverageTradingVolume'] * 1e6).toFixed(0)} (10d avg)`
    : null;

  // Market cap: prefer live profile value, then financials metric
  const marketCapLive = profile?.marketCapitalization
    ? profile.marketCapitalization * 1e6     // Finnhub profile value is in millions
    : (metrics['marketCapitalization'] ? metrics['marketCapitalization'] * 1e6 : null);

  const week52Low  = metrics['52WeekLow']  ?? null;
  const week52High = metrics['52WeekHigh'] ?? null;

  const cards = [
    {
      label: 'Current Price',
      value:    isLive                     ? `$${currentPrice.toFixed(2)}`                          : null,
      sub:      SYMBOL,
      icon:     DollarSign,
      accent:   false,
    },
    {
      label: 'Daily Change',
      value:    isLive                     ? `${dailyChange >= 0 ? '+' : ''}$${dailyChange.toFixed(2)}` : null,
      sub:      isLive                     ? `${dailyChangePct >= 0 ? '+' : ''}${dailyChangePct.toFixed(2)}%` : null,
      icon:     TrendingUp,
      positive: dailyChange >= 0,
      accent:   true,
    },
    {
      label: 'Avg Volume',
      value:    avgVolume10d               ? avgVolume10d                                           : null,
      sub:      avgVolume10d               ? '10-day avg'                                           : 'Unavailable',
      icon:     BarChart2,
      accent:   false,
      unavailable: !avgVolume10d,
    },
    {
      label: 'Market Cap',
      value:    marketCapLive !== null     ? formatLarge(marketCapLive)                             : null,
      sub:      'USD',
      icon:     Building2,
      accent:   false,
    },
    {
      label: '52W Range',
      value:    week52Low !== null && week52High !== null
                                           ? `$${week52Low.toFixed(2)} — $${week52High.toFixed(2)}`
                                           : null,
      sub:      'Low — High',
      icon:     Activity,
      accent:   false,
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1">
        {loading ? (
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Loading…
          </div>
        ) : isLive ? (
          <div className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
            <Wifi className="h-2.5 w-2.5" /> Live · AAPL
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
            <WifiOff className="h-2.5 w-2.5" /> Unavailable
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="glass-card-hover rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <c.icon className="h-4 w-4 text-primary/70" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 font-medium">
                  {c.label}
                </p>
                {loading ? (
                  <Skeleton className="h-5 w-20 mt-1 bg-secondary/30" />
                ) : c.value !== null ? (
                  <p className={`text-base font-bold text-foreground truncate mt-1 tabular-nums ${
                    c.accent && c.positive !== undefined
                      ? (c.positive ? 'value-bull text-bull' : 'value-bear text-bear')
                      : ''
                  }`}>
                    {c.value}
                  </p>
                ) : (
                  <p className="text-base font-bold text-muted-foreground/25 mt-1">—</p>
                )}
                {c.sub && (
                  <p className={`text-[11px] font-medium mt-0.5 tabular-nums ${
                    c.positive !== undefined && c.value !== null
                      ? (c.positive ? 'text-bull/80' : 'text-bear/80')
                      : c.unavailable
                        ? 'text-muted-foreground/20'
                        : 'text-muted-foreground/40'
                  }`}>
                    {c.sub}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
