import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PieChart, TrendingUp, TrendingDown, Flame, Snowflake, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSectorPerformance } from '@/services/finnhub';

const sectorWeights: Record<string, number> = {
  Technology: 28.5,
  Healthcare: 13.2,
  Financials: 12.8,
  'Consumer Discretionary': 10.4,
  Industrials: 8.9,
  Energy: 7.6,
  'Communication Services': 6.8,
  'Consumer Staples': 5.3,
  Utilities: 4.2,
  'Real Estate': 3.8,
  Materials: 2.5,
};

const colors = [
  'bg-primary', 'bg-chart-accent', 'bg-bull', 'bg-primary/70',
  'bg-chart-accent/70', 'bg-bear/70', 'bg-bull/70', 'bg-muted-foreground/50',
  'bg-muted-foreground/40', 'bg-muted-foreground/30', 'bg-primary/40',
];

const SectorCounter = () => {
  const query = useQuery({ queryKey: ['market-sectors'], queryFn: getSectorPerformance, staleTime: 60_000, retry: 1 });
  const sectors = (query.data ?? []).map((sector, index) => ({
    ...sector,
    weight: sectorWeights[sector.name] ?? 0,
    color: colors[index % colors.length],
  }));

  const advancers = sectors.filter(s => s.changePercent > 0).length;
  const decliners = sectors.filter(s => s.changePercent < 0).length;
  const topSector = [...sectors].sort((a, b) => b.changePercent - a.changePercent)[0];
  const bottomSector = [...sectors].sort((a, b) => a.changePercent - b.changePercent)[0];
  const breadth = sectors.length ? ((advancers / sectors.length) * 100).toFixed(0) : '0';

  return (
    <DashboardLayout title="Sector Counter">
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className={`flex items-center gap-1.5 text-app-xs font-medium border border-border/20 rounded-md px-2 py-1 ${sectors.length ? 'text-bull/60' : 'text-muted-foreground/30'}`}>
            {sectors.length ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {sectors.length ? 'Live sector ETF performance' : 'Sector data unavailable'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Sectors', value: sectors.length.toString(), icon: PieChart },
            { label: 'Advancing', value: advancers.toString(), icon: TrendingUp, color: 'text-bull' },
            { label: 'Declining', value: decliners.toString(), icon: TrendingDown, color: 'text-bear' },
            { label: 'Breadth', value: `${breadth}%`, icon: BarChart3, color: advancers >= decliners ? 'text-bull' : 'text-bear' },
          ].map((c, i) => (
            <div key={c.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <p className="text-app-xs uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{c.label}</p>
                <c.icon className={`h-3.5 w-3.5 ${c.color ? c.color + '/70' : 'text-primary/70'}`} />
              </div>
              <p className={`text-lg font-bold mt-2 ${c.color || 'text-foreground'}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {topSector && bottomSector && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="glass-card-hover rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-3.5 w-3.5 text-bull/70" />
                <h2 className="section-header text-foreground/80">Top Sector</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{topSector.name}</p>
                  <p className="text-app-xs text-muted-foreground/35">{topSector.symbol} ETF proxy</p>
                </div>
                <p className="text-xl font-bold text-bull tabular-nums value-bull">+{topSector.changePercent.toFixed(2)}%</p>
              </div>
            </div>
            <div className="glass-card-hover rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Snowflake className="h-3.5 w-3.5 text-bear/70" />
                <h2 className="section-header text-foreground/80">Bottom Sector</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{bottomSector.name}</p>
                  <p className="text-app-xs text-muted-foreground/35">{bottomSector.symbol} ETF proxy</p>
                </div>
                <p className="text-xl font-bold text-bear tabular-nums value-bear">{bottomSector.changePercent.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
            <h2 className="section-header text-foreground/80">Sector Heatmap</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {sectors.map((s, i) => {
              const positive = s.changePercent >= 0;
              const intensity = Math.min(Math.abs(s.changePercent) / 1.5, 1);
              return (
                <div
                  key={s.name}
                  className="rounded-xl p-4 border border-border/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default animate-fade-up"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    backgroundColor: positive
                      ? `hsl(var(--bull) / ${0.04 + intensity * 0.12})`
                      : `hsl(var(--bear) / ${0.04 + intensity * 0.12})`,
                  }}
                >
                  <p className="text-app-sm font-semibold text-foreground/80">{s.name}</p>
                  <p className={`text-lg font-bold mt-1 tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{s.changePercent.toFixed(2)}%
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-app-xs text-muted-foreground/30 tabular-nums">{s.weight}%</span>
                    <span className="text-app-xs text-muted-foreground/30">{s.symbol}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
            <PieChart className="h-3.5 w-3.5 text-primary/70" />
            <h2 className="section-header text-foreground/80">S&P 500 Sector Breakdown</h2>
          </div>
          <div className="hidden md:grid grid-cols-5 gap-2 px-5 py-2.5 text-app-xs uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
            <span>Sector</span><span className="text-right">ETF</span><span className="text-right">Weight</span>
            <span className="text-right">Today</span><span className="text-right">Price</span>
          </div>
          <div className="divide-y divide-border/8">
            {sectors.map((s, i) => {
              const positive = s.changePercent >= 0;
              return (
                <div key={s.name} className="grid grid-cols-3 md:grid-cols-5 gap-2 py-3 px-5 items-center hover:bg-accent/10 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-app-sm text-foreground/80">{s.name}</span>
                  </div>
                  <span className="hidden md:block text-right text-app-sm text-muted-foreground/40">{s.symbol}</span>
                  <span className="hidden md:block text-right text-app-sm font-semibold text-foreground tabular-nums">{s.weight}%</span>
                  <div className="text-right flex items-center justify-end gap-1">
                    {positive ? <TrendingUp className="h-3 w-3 text-bull/60" /> : <TrendingDown className="h-3 w-3 text-bear/60" />}
                    <span className={`text-app-sm font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <span className="hidden md:block text-right text-app-sm text-muted-foreground/40 tabular-nums">${s.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SectorCounter;
