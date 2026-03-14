import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';

const indices = [
  { name: 'S&P 500', value: '5,234.18', change: '+0.82%', positive: true },
  { name: 'NASDAQ', value: '16,428.82', change: '+1.24%', positive: true },
  { name: 'DOW 30', value: '39,512.84', change: '-0.14%', positive: false },
  { name: 'Russell 2000', value: '2,089.42', change: '+0.56%', positive: true },
];

const sectors = [
  { name: 'Technology', change: '+1.42%', positive: true },
  { name: 'Healthcare', change: '+0.38%', positive: true },
  { name: 'Financials', change: '-0.22%', positive: false },
  { name: 'Energy', change: '-0.91%', positive: false },
  { name: 'Consumer', change: '+0.67%', positive: true },
  { name: 'Industrials', change: '+0.15%', positive: true },
];

const MarketOverview = () => (
  <DashboardLayout title="Market Overview">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div key={idx.name} className="glass-card-hover rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{idx.name}</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{idx.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${idx.positive ? 'text-bull' : 'text-bear'}`}>
              {idx.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {idx.change}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Sector Performance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sectors.map(s => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/20 hover:border-primary/20 transition-colors">
              <span className="text-sm text-foreground">{s.name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${s.positive ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'}`}>
                {s.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default MarketOverview;
