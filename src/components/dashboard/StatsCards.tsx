import { DollarSign, TrendingUp, BarChart2, Building2, Activity, Wifi, WifiOff } from 'lucide-react';
import { statsOverview } from '@/data/mockStockData';
import { useFinnhubQuote } from '@/hooks/useFinnhubQuote';
import { Skeleton } from '@/components/ui/skeleton';

const formatNumber = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
};

export function StatsCards() {
  const { data: quote, loading, isLive } = useFinnhubQuote('AAPL');

  const src = quote && isLive
    ? {
        currentPrice: quote.c,
        dailyChange: quote.d,
        dailyChangePercent: quote.dp,
        volume: statsOverview.volume, // quote endpoint doesn't provide volume
        marketCap: statsOverview.marketCap,
        fiftyTwoWeekLow: statsOverview.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: statsOverview.fiftyTwoWeekHigh,
      }
    : statsOverview;

  const cards = [
    {
      label: 'Current Price',
      value: `$${src.currentPrice.toFixed(2)}`,
      sub: 'AAPL',
      icon: DollarSign,
      accent: false,
    },
    {
      label: 'Daily Change',
      value: `${src.dailyChange >= 0 ? '+' : ''}$${src.dailyChange.toFixed(2)}`,
      sub: `${src.dailyChangePercent >= 0 ? '+' : ''}${src.dailyChangePercent.toFixed(2)}%`,
      icon: TrendingUp,
      positive: src.dailyChange >= 0,
      accent: true,
    },
    {
      label: 'Volume',
      value: formatNumber(src.volume),
      sub: 'Today',
      icon: BarChart2,
      accent: false,
    },
    {
      label: 'Market Cap',
      value: formatNumber(src.marketCap),
      sub: 'USD',
      icon: Building2,
      accent: false,
    },
    {
      label: '52W Range',
      value: `$${src.fiftyTwoWeekLow} — $${src.fiftyTwoWeekHigh}`,
      sub: 'Low — High',
      icon: Activity,
      accent: false,
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1">
        {isLive ? (
          <div className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
            <Wifi className="h-2.5 w-2.5" /> Live
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
            <WifiOff className="h-2.5 w-2.5" /> Mock
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
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 font-medium">{c.label}</p>
                {loading ? (
                  <Skeleton className="h-5 w-20 mt-1 bg-secondary/30" />
                ) : (
                  <p className={`text-base font-bold text-foreground truncate mt-1 tabular-nums ${
                    c.accent && c.positive !== undefined ? (c.positive ? 'value-bull text-bull' : 'value-bear text-bear') : ''
                  }`}>{c.value}</p>
                )}
                {c.sub && (
                  <p className={`text-[11px] font-medium mt-0.5 tabular-nums ${
                    c.positive !== undefined
                      ? (c.positive ? 'text-bull/80' : 'text-bear/80')
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
