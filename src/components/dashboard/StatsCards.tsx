import { DollarSign, TrendingUp, BarChart2, Building2, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  },
  {
    label: 'Daily Change',
    value: `${statsOverview.dailyChange >= 0 ? '+' : ''}$${statsOverview.dailyChange.toFixed(2)}`,
    sub: `${statsOverview.dailyChangePercent >= 0 ? '+' : ''}${statsOverview.dailyChangePercent.toFixed(2)}%`,
    icon: TrendingUp,
    positive: statsOverview.dailyChange >= 0,
  },
  {
    label: 'Volume',
    value: formatNumber(statsOverview.volume),
    sub: 'Today',
    icon: BarChart2,
  },
  {
    label: 'Market Cap',
    value: formatNumber(statsOverview.marketCap),
    sub: 'USD',
    icon: Building2,
  },
  {
    label: '52W Range',
    value: `$${statsOverview.fiftyTwoWeekLow} — $${statsOverview.fiftyTwoWeekHigh}`,
    sub: 'Low — High',
    icon: Activity,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map(c => (
        <Card key={c.label} className="border-border bg-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{c.value}</p>
              {c.sub && (
                <p className={`text-xs ${c.positive !== undefined ? (c.positive ? 'text-bull' : 'text-bear') : 'text-muted-foreground'}`}>
                  {c.sub}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
