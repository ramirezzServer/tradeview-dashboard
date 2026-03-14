import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, avgCost: 172.40, current: 189.84, allocation: 32 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 10, avgCost: 680.00, current: 881.86, allocation: 30 },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: 20, avgCost: 220.15, current: 248.42, allocation: 17 },
  { symbol: 'MSFT', name: 'Microsoft', shares: 8, avgCost: 380.00, current: 425.52, allocation: 11 },
  { symbol: 'BTC', name: 'Bitcoin', shares: 0.1, avgCost: 85000, current: 97432.50, allocation: 10 },
];

const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.current, 0);
const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgCost, 0);
const totalPnL = totalValue - totalCost;
const totalPnLPct = (totalPnL / totalCost) * 100;

const Portfolio = () => (
  <DashboardLayout title="Portfolio">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, positive: totalPnL >= 0 },
          { label: 'Return', value: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`, positive: totalPnLPct >= 0 },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{c.label}</p>
            <p className={`text-lg font-bold mt-1 ${c.positive !== undefined ? (c.positive ? 'text-bull' : 'text-bear') : 'text-foreground'}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Holdings</h2>
        </div>
        <div className="px-5 pb-4">
          <div className="grid grid-cols-6 text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold pb-2 border-b border-border/20">
            <span>Asset</span><span className="text-right">Shares</span><span className="text-right">Avg Cost</span>
            <span className="text-right">Current</span><span className="text-right">P&L</span><span className="text-right">Alloc</span>
          </div>
          {holdings.map(h => {
            const pnl = (h.current - h.avgCost) * h.shares;
            const pnlPct = ((h.current - h.avgCost) / h.avgCost) * 100;
            const positive = pnl >= 0;
            return (
              <div key={h.symbol} className="grid grid-cols-6 py-3 items-center border-b border-border/10 hover:bg-accent/20 transition-colors rounded-md px-1">
                <div>
                  <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                  <p className="text-[9px] text-muted-foreground/50">{h.name}</p>
                </div>
                <p className="text-right text-xs text-foreground tabular-nums">{h.shares}</p>
                <p className="text-right text-xs text-muted-foreground tabular-nums">${h.avgCost.toLocaleString()}</p>
                <p className="text-right text-xs font-semibold text-foreground tabular-nums">${h.current.toLocaleString()}</p>
                <div className="text-right flex items-center justify-end gap-1">
                  {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                  <span className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                    {positive ? '+' : ''}{pnlPct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-right text-xs text-muted-foreground tabular-nums">{h.allocation}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Portfolio;
