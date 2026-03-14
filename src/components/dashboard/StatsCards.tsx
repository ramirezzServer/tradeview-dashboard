import { DollarSign, TrendingUp, BarChart2, Building2, Activity } from 'lucide-react';
import { statsOverview } from '@/data/mockStockData';

const formatNumber = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
};

const cards = [
  {
    label: 'Current Price',
    value: `$${statsOverview.currentPrice.toFixed(2)}`,
    sub: 'AAPL',
    icon: DollarSign,
    accent: false,
  },
  {
    label: 'Daily Change',
    value: `${statsOverview.dailyChange >= 0 ? '+' : ''}$${statsOverview.dailyChange.toFixed(2)}`,
    sub: `${statsOverview.dailyChangePercent >= 0 ? '+' : ''}${statsOverview.dailyChangePercent.toFixed(2)}%`,
    icon: TrendingUp,
    positive: statsOverview.dailyChange >= 0,
    accent: true,
  },
  {
    label: 'Volume',
    value: formatNumber(statsOverview.volume),
    sub: 'Today',
    icon: BarChart2,
    accent: false,
  },
  {
    label: 'Market Cap',
    value: formatNumber(statsOverview.marketCap),
    sub: 'USD',
    icon: Building2,
    accent: false,
  },
  {
    label: '52W Range',
    value: `$${statsOverview.fiftyTwoWeekLow} — $${statsOverview.fiftyTwoWeekHigh}`,
    sub: 'Low — High',
    icon: Activity,
    accent: false,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="glass-card-hover rounded-xl p-4 animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
              <c.icon className="h-4 w-4 text-primary/80" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">{c.label}</p>
              <p className="text-sm font-bold text-foreground truncate mt-0.5">{c.value}</p>
              {c.sub && (
                <p className={`text-[11px] font-medium mt-0.5 ${
                  c.positive !== undefined
                    ? (c.positive ? 'text-bull' : 'text-bear')
                    : 'text-muted-foreground/60'
                }`}>
                  {c.sub}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
