import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PieChart, TrendingUp, TrendingDown, Flame, Snowflake, BarChart3 } from 'lucide-react';

const sectors = [
  { name: 'Technology', weight: 28.5, change: 1.42, weekChange: 3.18, stocks: 82, topStock: 'NVDA +1.64%', color: 'bg-primary' },
  { name: 'Healthcare', weight: 13.2, change: 0.38, weekChange: -0.42, stocks: 64, topStock: 'UNH +0.92%', color: 'bg-chart-accent' },
  { name: 'Financials', weight: 12.8, change: -0.22, weekChange: 1.05, stocks: 71, topStock: 'JPM +0.48%', color: 'bg-bull' },
  { name: 'Consumer Disc.', weight: 10.4, change: 0.67, weekChange: 2.34, stocks: 53, topStock: 'AMZN +1.12%', color: 'bg-primary/70' },
  { name: 'Industrials', weight: 8.9, change: 0.15, weekChange: 0.86, stocks: 78, topStock: 'CAT +0.76%', color: 'bg-chart-accent/70' },
  { name: 'Energy', weight: 7.6, change: -0.91, weekChange: -2.14, stocks: 28, topStock: 'XOM -0.82%', color: 'bg-bear/70' },
  { name: 'Comm. Services', weight: 6.8, change: 1.05, weekChange: 1.92, stocks: 26, topStock: 'META +2.18%', color: 'bg-bull/70' },
  { name: 'Consumer Staples', weight: 5.3, change: 0.08, weekChange: -0.28, stocks: 38, topStock: 'PG +0.14%', color: 'bg-muted-foreground/50' },
  { name: 'Utilities', weight: 4.2, change: -0.34, weekChange: -0.56, stocks: 31, topStock: 'NEE -0.42%', color: 'bg-muted-foreground/40' },
  { name: 'Real Estate', weight: 3.8, change: -0.18, weekChange: 0.72, stocks: 33, topStock: 'PLD +0.38%', color: 'bg-muted-foreground/30' },
  { name: 'Materials', weight: 2.5, change: 0.42, weekChange: 1.14, stocks: 29, topStock: 'LIN +0.56%', color: 'bg-primary/40' },
];

const advancers = sectors.filter(s => s.change > 0).length;
const decliners = sectors.filter(s => s.change < 0).length;
const topSector = [...sectors].sort((a, b) => b.change - a.change)[0];
const bottomSector = [...sectors].sort((a, b) => a.change - b.change)[0];

const SectorCounter = () => (
  <DashboardLayout title="Sector Counter">
    <div className="p-4 lg:p-6 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Sectors', value: sectors.length.toString(), icon: PieChart },
          { label: 'Advancing', value: advancers.toString(), icon: TrendingUp, color: 'text-bull' },
          { label: 'Declining', value: decliners.toString(), icon: TrendingDown, color: 'text-bear' },
          { label: 'Breadth', value: `${((advancers / sectors.length) * 100).toFixed(0)}%`, icon: BarChart3, color: advancers > decliners ? 'text-bull' : 'text-bear' },
        ].map((c, i) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{c.label}</p>
              <c.icon className={`h-3.5 w-3.5 ${c.color || 'text-primary'}`} />
            </div>
            <p className={`text-lg font-bold mt-2 ${c.color || 'text-foreground'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Top & Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-bull" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Top Sector</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">{topSector.name}</p>
              <p className="text-[10px] text-muted-foreground/50">{topSector.stocks} stocks · {topSector.weight}% weight</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-bull tabular-nums">+{topSector.change.toFixed(2)}%</p>
              <p className="text-[10px] text-muted-foreground/50">1W: {topSector.weekChange >= 0 ? '+' : ''}{topSector.weekChange.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Snowflake className="h-4 w-4 text-bear" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Bottom Sector</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">{bottomSector.name}</p>
              <p className="text-[10px] text-muted-foreground/50">{bottomSector.stocks} stocks · {bottomSector.weight}% weight</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-bear tabular-nums">{bottomSector.change.toFixed(2)}%</p>
              <p className="text-[10px] text-muted-foreground/50">1W: {bottomSector.weekChange >= 0 ? '+' : ''}{bottomSector.weekChange.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap-style Grid */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Sector Heatmap</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sectors.map((s, i) => {
            const positive = s.change >= 0;
            const intensity = Math.min(Math.abs(s.change) / 1.5, 1);
            return (
              <div
                key={s.name}
                className="rounded-xl p-4 border border-border/20 transition-all duration-300 hover:scale-[1.02] cursor-default animate-fade-up"
                style={{
                  animationDelay: `${i * 40}ms`,
                  backgroundColor: positive
                    ? `hsl(var(--bull) / ${0.05 + intensity * 0.15})`
                    : `hsl(var(--bear) / ${0.05 + intensity * 0.15})`,
                }}
              >
                <p className="text-xs font-semibold text-foreground">{s.name}</p>
                <p className={`text-lg font-bold mt-1 tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                  {positive ? '+' : ''}{s.change.toFixed(2)}%
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-muted-foreground/50">{s.weight}%</span>
                  <span className="text-[9px] text-muted-foreground/50">{s.topStock}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/20">
          <PieChart className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">S&P 500 Sector Breakdown</h2>
        </div>
        <div className="hidden md:grid grid-cols-6 gap-2 px-5 py-2.5 text-[9px] uppercase tracking-wider text-muted-foreground/40 font-semibold border-b border-border/10">
          <span>Sector</span><span className="text-right">Weight</span><span className="text-right">Today</span>
          <span className="text-right">1 Week</span><span className="text-right">Stocks</span><span className="text-right">Top Stock</span>
        </div>
        <div className="divide-y divide-border/10">
          {sectors.map((s, i) => {
            const positive = s.change >= 0;
            const weekPositive = s.weekChange >= 0;
            return (
              <div
                key={s.name}
                className="grid grid-cols-3 md:grid-cols-6 gap-2 py-3 px-5 items-center hover:bg-accent/20 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <span className="hidden md:block text-right text-xs font-semibold text-foreground tabular-nums">{s.weight}%</span>
                <div className="text-right flex items-center justify-end gap-1">
                  {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                  <span className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{s.change.toFixed(2)}%
                  </span>
                </div>
                <span className={`hidden md:block text-right text-xs tabular-nums ${weekPositive ? 'text-bull' : 'text-bear'}`}>
                  {weekPositive ? '+' : ''}{s.weekChange.toFixed(2)}%
                </span>
                <span className="hidden md:block text-right text-xs text-muted-foreground tabular-nums">{s.stocks}</span>
                <span className="hidden md:block text-right text-[10px] text-muted-foreground/60">{s.topStock}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default SectorCounter;
