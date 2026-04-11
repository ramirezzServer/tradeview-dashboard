import { useMarketQuote } from '@/hooks/useMarketQuote';
import { useFinnhubProfile } from '@/hooks/useFinnhubProfile';
import { Skeleton } from '@/components/ui/skeleton';

const SYMBOL = 'AAPL';

/**
 * Shows the day trading range and 52-week range for AAPL.
 *
 * Data sources:
 *  - Day range (h, l, c, o, pc)  — Finnhub /quote   → useMarketQuote (shared cache)
 *  - 52W range, avg volume       — Finnhub financials → useFinnhubProfile (shared cache)
 *
 * No data is hardcoded or simulated.
 */
export function DailyRangeCard() {
  // Shares the React Query cache with StatsCards (same queryKey)
  const { data: quote, isLoading: quoteLoading, isLive } = useMarketQuote(SYMBOL);

  // Shares cache with StatsCards as well
  const { data: profileData, loading: profileLoading } = useFinnhubProfile(SYMBOL);
  const metrics = profileData?.metrics ?? {};

  const loading = quoteLoading || profileLoading;

  // ── Live values from quote ─────────────────────────────────────────────────
  const current  = quote?.c  ?? null;
  const dayHigh  = quote?.h  ?? null;
  const dayLow   = quote?.l  ?? null;
  const open     = quote?.o  ?? null;
  const prevClose = quote?.pc ?? null;

  // ── 52-week from financials ────────────────────────────────────────────────
  const week52Low  = metrics['52WeekLow']  ?? null;
  const week52High = metrics['52WeekHigh'] ?? null;

  // ── Range position helpers (clamp to 0–100 to guard edge cases) ───────────
  const rangePos = (val: number, lo: number, hi: number): number => {
    if (hi === lo) return 50;
    return Math.max(0, Math.min(100, ((val - lo) / (hi - lo)) * 100));
  };

  const dayPos  = current !== null && dayLow !== null && dayHigh !== null
    ? rangePos(current, dayLow, dayHigh) : null;

  const yearPos = current !== null && week52Low !== null && week52High !== null
    ? rangePos(current, week52Low, week52High) : null;

  const avgVolume = metrics['10DayAverageTradingVolume']
    ? `${(metrics['10DayAverageTradingVolume']).toFixed(1)}M`
    : null;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <h3 className="section-header text-foreground/80">Price Range</h3>

      {/* Day Range */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-muted-foreground/50 tabular-nums">
          <span>Day Range</span>
          {!loading && dayLow !== null && dayHigh !== null ? (
            <span>${dayLow.toFixed(2)} — ${dayHigh.toFixed(2)}</span>
          ) : (
            loading ? <Skeleton className="h-3 w-28 bg-secondary/30" /> : <span>—</span>
          )}
        </div>
        <div className="relative h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          {dayPos !== null && (
            <>
              <div
                className="h-full rounded-full bg-gradient-to-r from-bear/50 via-chart-accent/60 to-bull/50 transition-all duration-700"
                style={{ width: `${dayPos}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70 rounded-full"
                style={{ left: `${dayPos}%` }}
              />
            </>
          )}
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-muted-foreground/50 tabular-nums">
          <span>52W Range</span>
          {!loading && week52Low !== null && week52High !== null ? (
            <span>${week52Low.toFixed(2)} — ${week52High.toFixed(2)}</span>
          ) : (
            loading ? <Skeleton className="h-3 w-28 bg-secondary/30" /> : <span>—</span>
          )}
        </div>
        <div className="relative h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          {yearPos !== null && (
            <>
              <div
                className="h-full rounded-full bg-gradient-to-r from-bear/50 via-chart-accent/60 to-bull/50 transition-all duration-700"
                style={{ width: `${yearPos}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70 rounded-full"
                style={{ left: `${yearPos}%` }}
              />
            </>
          )}
        </div>
      </div>

      {/* Footer metrics */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/15">
        {[
          {
            label: 'Open',
            value: !loading && open !== null      ? `$${open.toFixed(2)}`      : null,
          },
          {
            label: 'Prev Close',
            value: !loading && prevClose !== null ? `$${prevClose.toFixed(2)}` : null,
          },
          {
            label: 'Avg Vol',
            value: !loading && avgVolume          ? avgVolume                  : null,
          },
        ].map(item => (
          <div key={item.label} className="text-center">
            <p className="text-[8px] text-muted-foreground/35 uppercase tracking-[0.12em]">{item.label}</p>
            {loading ? (
              <Skeleton className="h-4 w-10 mx-auto mt-0.5 bg-secondary/30" />
            ) : (
              <p className={`text-[11px] font-bold mt-0.5 tabular-nums ${
                item.value !== null ? 'text-foreground' : 'text-muted-foreground/25'
              }`}>
                {item.value ?? '—'}
              </p>
            )}
          </div>
        ))}
      </div>

      {!isLive && !loading && (
        <p className="text-[8px] text-muted-foreground/25 text-center -mt-2">
          Price data unavailable
        </p>
      )}
    </div>
  );
}
