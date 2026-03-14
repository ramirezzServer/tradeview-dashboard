import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileBarChart } from 'lucide-react';

const financials = {
  summary: [
    { label: 'Revenue (TTM)', value: '$383.3B' },
    { label: 'Net Income', value: '$97.0B' },
    { label: 'EPS (TTM)', value: '$6.42' },
    { label: 'P/E Ratio', value: '29.6x' },
    { label: 'Dividend Yield', value: '0.52%' },
    { label: 'Beta', value: '1.24' },
  ],
  quarterly: [
    { quarter: 'Q4 2025', revenue: '$119.6B', earnings: '$2.18', surprise: '+4.2%' },
    { quarter: 'Q3 2025', revenue: '$94.9B', earnings: '$1.64', surprise: '+2.8%' },
    { quarter: 'Q2 2025', revenue: '$85.8B', earnings: '$1.40', surprise: '+1.5%' },
    { quarter: 'Q1 2025', revenue: '$90.8B', earnings: '$1.52', surprise: '+3.1%' },
  ],
};

const FinancialSnapshot = () => (
  <DashboardLayout title="Financial Snapshot">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {financials.summary.map((f, i) => (
          <div
            key={f.label}
            className="glass-card-hover rounded-xl p-4 text-center animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">{f.label}</p>
            <p className="text-sm font-bold text-foreground mt-1">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileBarChart className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Earnings History — AAPL</h2>
        </div>
        <div className="grid grid-cols-4 text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold pb-2 border-b border-border/20 px-2">
          <span>Quarter</span><span className="text-right">Revenue</span><span className="text-right">EPS</span><span className="text-right">Surprise</span>
        </div>
        {financials.quarterly.map((q, i) => (
          <div
            key={q.quarter}
            className="grid grid-cols-4 py-3 px-2 items-center border-b border-border/10 hover:bg-accent/20 transition-colors rounded-md animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="text-sm font-semibold text-foreground">{q.quarter}</span>
            <span className="text-right text-xs text-foreground tabular-nums">{q.revenue}</span>
            <span className="text-right text-xs text-foreground tabular-nums">{q.earnings}</span>
            <span className="text-right text-xs font-semibold text-bull tabular-nums">{q.surprise}</span>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default FinancialSnapshot;
