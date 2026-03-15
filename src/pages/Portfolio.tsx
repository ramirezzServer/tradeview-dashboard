import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, TrendingUp, TrendingDown, Wallet, PieChart, Award, AlertTriangle } from 'lucide-react';

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, avgCost: 172.40, current: 189.84, allocation: 28, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 10, avgCost: 680.00, current: 881.86, allocation: 26, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: 20, avgCost: 220.15, current: 248.42, allocation: 15, sector: 'Consumer' },
  { symbol: 'MSFT', name: 'Microsoft', shares: 8, avgCost: 380.00, current: 425.52, allocation: 10, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms', shares: 5, avgCost: 460.00, current: 502.30, allocation: 7, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com', shares: 12, avgCost: 170.00, current: 182.15, allocation: 6, sector: 'Consumer' },
  { symbol: 'BTC', name: 'Bitcoin', shares: 0.1, avgCost: 85000, current: 97432.50, allocation: 5, sector: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', shares: 2, avgCost: 3400, current: 3842.15, allocation: 3, sector: 'Crypto' },
];

const totalValue = holdings.reduce((s, h) => s + h.shares * h.current, 0);
const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
const totalPnL = totalValue - totalCost;
const totalPnLPct = (totalPnL / totalCost) * 100;
const dailyPnL = 1842.56;

const best = [...holdings].sort((a, b) => ((b.current - b.avgCost) / b.avgCost) - ((a.current - a.avgCost) / a.avgCost))[0];
const worst = [...holdings].sort((a, b) => ((a.current - a.avgCost) / a.avgCost) - ((b.current - b.avgCost) / b.avgCost))[0];

const allocationColors = [
  'bg-primary', 'bg-chart-accent', 'bg-bull', 'bg-primary/70',
  'bg-chart-accent/70', 'bg-bull/70', 'bg-bear/50', 'bg-muted-foreground/40',
];

const Portfolio = () => (
  <DashboardLayout title="Portfolio">
    <div className="p-4 lg:p-6 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet },
          { label: 'Daily P/L', value: `+$${dailyPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-bull' },
          { label: 'Total P/L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: totalPnL >= 0 ? TrendingUp : TrendingDown, color: totalPnL >= 0 ? 'text-bull' : 'text-bear', sub: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%` },
          { label: 'Total Holdings', value: holdings.length.toString(), icon: Briefcase, sub: 'Active positions' },
        ].map((c, i) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{c.label}</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
                <c.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className={`text-lg font-bold mt-2 tabular-nums ${c.color || 'text-foreground'}`}>{c.value}</p>
            {c.sub && <p className="text-[10px] text-muted-foreground/40 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Holdings Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/20">
            <Briefcase className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Holdings</h2>
          </div>

          <div className="hidden md:grid grid-cols-7 gap-2 px-5 py-2.5 text-[9px] uppercase tracking-wider text-muted-foreground/40 font-semibold border-b border-border/10">
            <span>Asset</span><span className="text-right">Shares</span><span className="text-right">Avg Cost</span>
            <span className="text-right">Current</span><span className="text-right">Value</span><span className="text-right">P&L</span><span className="text-right">Alloc</span>
          </div>

          <div className="divide-y divide-border/10">
            {holdings.map((h, i) => {
              const pnl = (h.current - h.avgCost) * h.shares;
              const pnlPct = ((h.current - h.avgCost) / h.avgCost) * 100;
              const positive = pnl >= 0;
              const value = h.shares * h.current;
              return (
                <div
                  key={h.symbol}
                  className="grid grid-cols-3 md:grid-cols-7 gap-2 items-center px-5 py-3 hover:bg-accent/20 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                    <p className="text-[9px] text-muted-foreground/50">{h.name}</p>
                  </div>
                  <p className="hidden md:block text-right text-xs text-foreground tabular-nums">{h.shares}</p>
                  <p className="hidden md:block text-right text-xs text-muted-foreground tabular-nums">${h.avgCost.toLocaleString()}</p>
                  <p className="text-right text-xs font-semibold text-foreground tabular-nums">${h.current.toLocaleString()}</p>
                  <p className="hidden md:block text-right text-xs text-foreground tabular-nums">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="text-right flex items-center justify-end gap-1">
                    {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                    <span className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{pnlPct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="hidden md:block text-right text-xs text-muted-foreground tabular-nums">{h.allocation}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Allocation */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Allocation</h2>
            </div>
            {/* Bar visualization */}
            <div className="flex h-3 rounded-full overflow-hidden mb-4">
              {holdings.map((h, i) => (
                <div
                  key={h.symbol}
                  className={`${allocationColors[i]} transition-all duration-500`}
                  style={{ width: `${h.allocation}%` }}
                  title={`${h.symbol}: ${h.allocation}%`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {holdings.map((h, i) => (
                <div key={h.symbol} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${allocationColors[i]}`} />
                  <span className="text-[10px] text-muted-foreground/60">{h.symbol}</span>
                  <span className="text-[10px] font-semibold text-foreground ml-auto tabular-nums">{h.allocation}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best & Worst */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-bull" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Best Performer</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{best.symbol}</p>
                <p className="text-[10px] text-muted-foreground/50">{best.name}</p>
              </div>
              <span className="text-sm font-bold text-bull tabular-nums">
                +{(((best.current - best.avgCost) / best.avgCost) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-bear" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Weakest Position</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{worst.symbol}</p>
                <p className="text-[10px] text-muted-foreground/50">{worst.name}</p>
              </div>
              <span className={`text-sm font-bold tabular-nums ${((worst.current - worst.avgCost) / worst.avgCost) >= 0 ? 'text-bull' : 'text-bear'}`}>
                {((worst.current - worst.avgCost) / worst.avgCost) >= 0 ? '+' : ''}{(((worst.current - worst.avgCost) / worst.avgCost) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Portfolio;
