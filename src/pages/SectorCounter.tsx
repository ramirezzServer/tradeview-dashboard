import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';

const sectors = [
  { name: 'Technology', weight: 28.5, change: 1.42, stocks: 82 },
  { name: 'Healthcare', weight: 13.2, change: 0.38, stocks: 64 },
  { name: 'Financials', weight: 12.8, change: -0.22, stocks: 71 },
  { name: 'Consumer Discretionary', weight: 10.4, change: 0.67, stocks: 53 },
  { name: 'Industrials', weight: 8.9, change: 0.15, stocks: 78 },
  { name: 'Energy', weight: 7.6, change: -0.91, stocks: 28 },
  { name: 'Communication Services', weight: 6.8, change: 1.05, stocks: 26 },
  { name: 'Utilities', weight: 4.2, change: -0.34, stocks: 31 },
  { name: 'Real Estate', weight: 3.8, change: -0.18, stocks: 33 },
  { name: 'Materials', weight: 2.5, change: 0.42, stocks: 29 },
  { name: 'Consumer Staples', weight: 1.3, change: 0.08, stocks: 38 },
];

const SectorCounter = () => (
  <DashboardLayout title="Sector Counter">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">S&P 500 Sector Breakdown</h2>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-4 text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold pb-2 border-b border-border/20 px-2">
            <span>Sector</span><span className="text-right">Weight</span><span className="text-right">Change</span><span className="text-right">Stocks</span>
          </div>
          {sectors.map((s, i) => {
            const positive = s.change >= 0;
            return (
              <div
                key={s.name}
                className="grid grid-cols-4 py-3 px-2 items-center rounded-lg hover:bg-accent/20 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-foreground tabular-nums">{s.weight}%</span>
                </div>
                <div className="text-right flex items-center justify-end gap-1">
                  {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                  <span className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{s.change.toFixed(2)}%
                  </span>
                </div>
                <p className="text-right text-xs text-muted-foreground tabular-nums">{s.stocks}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default SectorCounter;
