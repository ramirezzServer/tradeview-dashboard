import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LineChart, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const indicators = [
  { name: 'RSI (14)', value: '62.4', signal: 'Neutral', color: 'text-chart-accent' },
  { name: 'MACD', value: '1.82', signal: 'Bullish', color: 'text-bull' },
  { name: 'Moving Avg (50)', value: '$184.20', signal: 'Above', color: 'text-bull' },
  { name: 'Moving Avg (200)', value: '$176.50', signal: 'Above', color: 'text-bull' },
  { name: 'Bollinger Bands', value: 'Upper', signal: 'Overbought', color: 'text-bear' },
  { name: 'Stochastic', value: '78.3', signal: 'Neutral', color: 'text-chart-accent' },
];

const summary = { bullish: 8, neutral: 4, bearish: 2 };

const TechnicalAnalysis = () => (
  <DashboardLayout title="Technical Analysis">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bullish', count: summary.bullish, color: 'text-bull', bg: 'bg-bull/10' },
          { label: 'Neutral', count: summary.neutral, color: 'text-chart-accent', bg: 'bg-chart-accent/10' },
          { label: 'Bearish', count: summary.bearish, color: 'text-bear', bg: 'bg-bear/10' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            <div className={`h-1 w-12 mx-auto mt-2 rounded-full ${s.bg}`} />
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Indicators — AAPL</h2>
        </div>
        <div className="space-y-1">
          {indicators.map(ind => (
            <div key={ind.name} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-accent/20 transition-colors">
              <span className="text-sm text-foreground">{ind.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground tabular-nums">{ind.value}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${ind.color}`}>{ind.signal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default TechnicalAnalysis;
