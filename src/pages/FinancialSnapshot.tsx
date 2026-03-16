import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileBarChart, DollarSign, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const keyMetrics = [
  { label: 'Revenue (TTM)', value: '$383.3B', change: '+8.2%', positive: true },
  { label: 'Net Income', value: '$97.0B', change: '+12.4%', positive: true },
  { label: 'EPS (TTM)', value: '$6.42', change: '+10.8%', positive: true },
  { label: 'Market Cap', value: '$2.94T', change: '+18.6%', positive: true },
  { label: 'P/E Ratio', value: '29.6x', change: 'vs 28.2x avg', positive: false, neutral: true },
  { label: 'Dividend Yield', value: '0.52%', change: '$0.96/yr', positive: true, neutral: true },
];

const valuationMetrics = [
  { label: 'P/E (Forward)', value: '27.8x' },
  { label: 'PEG Ratio', value: '2.14' },
  { label: 'P/S Ratio', value: '7.66x' },
  { label: 'P/B Ratio', value: '48.2x' },
  { label: 'EV/EBITDA', value: '22.4x' },
  { label: 'Free Cash Flow', value: '$112.4B' },
  { label: 'Debt/Equity', value: '1.52' },
  { label: 'Current Ratio', value: '1.07' },
  { label: 'ROE', value: '160.8%' },
  { label: 'ROA', value: '28.4%' },
  { label: 'Gross Margin', value: '46.2%' },
  { label: 'Operating Margin', value: '30.8%' },
  { label: 'Net Margin', value: '25.3%' },
  { label: 'Beta', value: '1.24' },
  { label: 'Shares Outstanding', value: '15.46B' },
  { label: 'Float', value: '15.42B' },
];

const quarterlyData = [
  { quarter: 'Q1 2025', revenue: 90.8, earnings: 1.52, surprise: '+3.1%', positive: true },
  { quarter: 'Q2 2025', revenue: 85.8, earnings: 1.40, surprise: '+1.5%', positive: true },
  { quarter: 'Q3 2025', revenue: 94.9, earnings: 1.64, surprise: '+2.8%', positive: true },
  { quarter: 'Q4 2025', revenue: 119.6, earnings: 2.18, surprise: '+4.2%', positive: true },
];

const revenueChart = [
  { q: 'Q1 24', rev: 82.5 },
  { q: 'Q2 24', rev: 78.4 },
  { q: 'Q3 24', rev: 89.5 },
  { q: 'Q4 24', rev: 111.4 },
  { q: 'Q1 25', rev: 90.8 },
  { q: 'Q2 25', rev: 85.8 },
  { q: 'Q3 25', rev: 94.9 },
  { q: 'Q4 25', rev: 119.6 },
];

const FinancialSnapshot = () => (
  <DashboardLayout title="Financial Snapshot">
    <div className="p-4 lg:p-6 space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {keyMetrics.map((f, i) => (
          <div key={f.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35 font-medium">{f.label}</p>
            <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{f.value}</p>
            <p className={`text-[9px] font-semibold mt-1 ${f.neutral ? 'text-muted-foreground/40' : f.positive ? 'text-bull' : 'text-bear'}`}>
              {f.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          {/* Revenue Chart */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Quarterly Revenue — AAPL</h2>
              <span className="ml-auto text-[9px] text-muted-foreground/30">In billions USD</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart} barCategoryGap="20%">
                  <XAxis dataKey="q" tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11, boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.5)' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    formatter={(value: number) => [`$${value}B`, 'Revenue']}
                  />
                  <Bar dataKey="rev" radius={[4, 4, 0, 0]}>
                    {revenueChart.map((_, i) => (
                      <Cell key={i} fill={i >= 4 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.25)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings History */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
              <FileBarChart className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Earnings History</h2>
            </div>
            <div className="hidden md:grid grid-cols-4 gap-2 px-5 py-2.5 text-[8px] uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
              <span>Quarter</span><span className="text-right">Revenue</span><span className="text-right">EPS</span><span className="text-right">Surprise</span>
            </div>
            <div className="divide-y divide-border/8">
              {quarterlyData.map((q, i) => (
                <div
                  key={q.quarter}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2 py-3 px-5 items-center hover:bg-accent/10 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-[13px] font-semibold text-foreground">{q.quarter}</span>
                  <span className="hidden md:block text-right text-[11px] text-foreground/70 tabular-nums">${q.revenue}B</span>
                  <span className="text-right text-[11px] font-bold text-foreground tabular-nums">${q.earnings}</span>
                  <span className="hidden md:block text-right text-[11px] font-semibold text-bull tabular-nums">{q.surprise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Valuation */}
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Valuation & Fundamentals</h2>
            </div>
            <div className="space-y-0">
              {valuationMetrics.map(m => (
                <div
                  key={m.label}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground/45">{m.label}</span>
                  <span className="text-[11px] font-bold text-foreground tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Analyst Consensus</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Buy', count: 28, color: 'text-bull', bg: 'bg-bull/8' },
                { label: 'Hold', count: 8, color: 'text-chart-accent', bg: 'bg-chart-accent/8' },
                { label: 'Sell', count: 2, color: 'text-bear', bg: 'bg-bear/8' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-secondary/15 border border-border/10">
                  <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden">
              <div className="bg-bull/70" style={{ width: '73.7%' }} />
              <div className="bg-chart-accent/50" style={{ width: '21.1%' }} />
              <div className="bg-bear/70" style={{ width: '5.2%' }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[9px] text-muted-foreground/35">Target Price</span>
              <span className="text-[13px] font-bold text-foreground tabular-nums">$210.50</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-muted-foreground/35">Upside</span>
              <span className="text-[13px] font-bold text-bull tabular-nums value-bull">+10.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default FinancialSnapshot;
