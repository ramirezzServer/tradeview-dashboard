import { useState, useEffect, FormEvent } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Briefcase, TrendingUp, TrendingDown, Wallet,
  PieChart, Award, AlertTriangle, Plus, X, Loader2, RefreshCw,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Input } from '@/components/ui/input';
import { getQuote, isFinnhubConfigured } from '@/services/finnhub';

const allocationColors = [
  'bg-primary', 'bg-chart-accent', 'bg-bull', 'bg-primary/70',
  'bg-chart-accent/70', 'bg-bull/70', 'bg-bear/50', 'bg-muted-foreground/40',
];

// ─── Add Holding Form ─────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd: (symbol: string, quantity: number, avgCost: number) => Promise<void>;
  isAdding: boolean;
  error: string | null;
  onCancel: () => void;
}

function AddHoldingForm({ onAdd, isAdding, error, onCancel }: AddFormProps) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const qty = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    if (!symbol.trim() || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
      setLocalError('Please fill in all fields with valid values.');
      return;
    }
    try {
      await onAdd(symbol.trim().toUpperCase(), qty, cost);
    } catch {
      setLocalError(error ?? 'Failed to add holding.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-border/10 bg-accent/5">
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-3">New Holding</p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground/40 mb-1 block">Symbol</label>
          <Input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            className="h-8 w-24 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25 uppercase"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground/40 mb-1 block">Shares</label>
          <Input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="10"
            min="0.000001"
            step="any"
            className="h-8 w-24 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25"
            required
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground/40 mb-1 block">Avg Cost ($)</label>
          <Input
            type="number"
            value={avgCost}
            onChange={e => setAvgCost(e.target.value)}
            placeholder="150.00"
            min="0.0001"
            step="any"
            className="h-8 w-28 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isAdding}
          className="h-8 px-3 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground text-[11px] font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
        >
          {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {isAdding ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-lg text-muted-foreground/40 hover:text-foreground text-[11px] transition-colors"
        >
          Cancel
        </button>
        {(localError || error) && (
          <p className="text-[10px] text-bear w-full">{localError || error}</p>
        )}
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Portfolio = () => {
  const { items, isLoading, addHolding, removeHolding, isAdding, addError } = usePortfolio();
  const [showAddForm, setShowAddForm] = useState(false);

  // Live quote prices fetched from backend for each symbol.
  // null  = not yet fetched / fetch failed → fall back to avgCost and mark as estimated.
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesLive, setQuotesLive] = useState(false);

  const fetchQuotes = () => {
    if (!isFinnhubConfigured() || items.length === 0) return;
    setQuotesLoading(true);

    const symbols = [...new Set(items.map(i => i.symbol))];

    Promise.allSettled(symbols.map(s => getQuote(s))).then(results => {
      const map: Record<string, number | null> = {};
      let liveCount = 0;
      symbols.forEach((sym, idx) => {
        const r = results[idx];
        if (r.status === 'fulfilled' && r.value.c > 0) {
          map[sym] = r.value.c;
          liveCount++;
        } else {
          map[sym] = null;
        }
      });
      setLivePrices(map);
      setQuotesLive(liveCount > 0);
      setQuotesLoading(false);
    });
  };

  // Fetch quotes whenever the holdings list changes
  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Map backend items to display shape
  const holdings = items.map(item => {
    const live = livePrices[item.symbol];
    const avgCost = Number(item.average_cost);
    // live === null means the quote failed; fall back to avgCost so P/L shows 0
    const current = live ?? avgCost;
    const isEstimated = live === null || live === undefined;
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.notes ?? item.symbol,
      shares: item.quantity,
      avgCost,
      current,
      isEstimated,
    };
  });

  const totalValue    = holdings.reduce((s, h) => s + h.shares * h.current, 0);
  const totalCost     = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
  const totalPnL      = totalValue - totalCost;
  const totalPnLPct   = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const holdingsWithAlloc = holdings.map(h => ({
    ...h,
    value:      h.shares * h.current,
    allocation: totalValue > 0 ? Math.round((h.shares * h.current / totalValue) * 100) : 0,
  }));

  const best  = [...holdingsWithAlloc].sort((a, b) =>
    ((b.current - b.avgCost) / b.avgCost) - ((a.current - a.avgCost) / a.avgCost)
  )[0];
  const worst = [...holdingsWithAlloc].sort((a, b) =>
    ((a.current - a.avgCost) / a.avgCost) - ((b.current - b.avgCost) / b.avgCost)
  )[0];

  const handleAddHolding = async (symbol: string, quantity: number, avgCost: number) => {
    await addHolding({ symbol, quantity, average_cost: avgCost, notes: symbol });
    setShowAddForm(false);
  };

  const anyEstimated = holdings.some(h => h.isEstimated);

  return (
    <DashboardLayout title="Portfolio">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Value',    value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet },
            { label: 'Total P/L',      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: totalPnL >= 0 ? TrendingUp : TrendingDown, color: totalPnL >= 0 ? 'text-bull value-bull' : 'text-bear value-bear', sub: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%` },
            { label: 'Total Holdings', value: holdings.length.toString(), icon: Briefcase, sub: 'Active positions' },
            { label: 'Total Cost',     value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet },
          ].map((c, i) => (
            <div key={c.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{c.label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <c.icon className="h-3.5 w-3.5 text-primary/70" />
                </div>
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${c.color || 'text-foreground'}`}>{c.value}</p>
              {c.sub && <p className="text-[9px] text-muted-foreground/30 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          {/* Holdings Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
              <Briefcase className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Holdings</h2>

              {/* Live/estimated price badge */}
              <div className="flex items-center gap-1 ml-1">
                {quotesLoading ? (
                  <span className="flex items-center gap-1 text-[8px] text-muted-foreground/40">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Fetching prices…
                  </span>
                ) : quotesLive ? (
                  <span className="text-[8px] text-bull/60 font-medium">● Live prices</span>
                ) : items.length > 0 ? (
                  <span className="text-[8px] text-muted-foreground/40 font-medium">● Prices unavailable — showing cost basis</span>
                ) : null}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {!quotesLoading && items.length > 0 && (
                  <button
                    onClick={fetchQuotes}
                    className="text-muted-foreground/30 hover:text-primary transition-colors"
                    title="Refresh prices"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="flex items-center gap-1 text-[9px] font-semibold text-primary/60 hover:text-primary border border-primary/12 hover:border-primary/25 rounded-md px-2 py-1 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            </div>

            {/* Disclaimer when any price is estimated */}
            {anyEstimated && !quotesLoading && (
              <div className="px-5 py-2 border-b border-border/10 bg-bear/5">
                <p className="text-[9px] text-bear/60">
                  Some prices could not be fetched (marked ~). Current value and P/L are based on your average cost for those positions.
                </p>
              </div>
            )}

            {showAddForm && (
              <AddHoldingForm
                onAdd={handleAddHolding}
                isAdding={isAdding}
                error={addError}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            <div className="hidden md:grid grid-cols-7 gap-2 px-5 py-2.5 text-[8px] uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
              <span>Asset</span>
              <span className="text-right">Shares</span>
              <span className="text-right">Avg Cost</span>
              <span className="text-right">Current</span>
              <span className="text-right">Value</span>
              <span className="text-right">P&L</span>
              <span className="text-right">Alloc</span>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground/30">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            {!isLoading && holdings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
                <Briefcase className="h-6 w-6 mb-2 opacity-30" />
                <p className="text-[11px]">No holdings yet</p>
                <p className="text-[9px] mt-0.5">Click "Add" to track a position</p>
              </div>
            )}

            <div className="divide-y divide-border/8">
              {holdingsWithAlloc.map((h, i) => {
                const pnl      = (h.current - h.avgCost) * h.shares;
                const pnlPct   = h.avgCost > 0 ? ((h.current - h.avgCost) / h.avgCost) * 100 : 0;
                const positive = pnl >= 0;
                return (
                  <div
                    key={h.id}
                    className="grid grid-cols-3 md:grid-cols-7 gap-2 items-center px-5 py-3 hover:bg-accent/15 transition-colors animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{h.symbol}</p>
                        <p className="text-[9px] text-muted-foreground/35">{h.name !== h.symbol ? h.name : ''}</p>
                      </div>
                    </div>
                    <p className="hidden md:block text-right text-[11px] text-foreground/70 tabular-nums">{h.shares}</p>
                    <p className="hidden md:block text-right text-[11px] text-muted-foreground/50 tabular-nums">${h.avgCost.toLocaleString()}</p>
                    <p className="text-right text-[11px] font-semibold text-foreground tabular-nums">
                      {h.isEstimated ? (
                        <span className="text-muted-foreground/40" title="Live price unavailable — showing cost basis">~${h.current.toLocaleString()}</span>
                      ) : (
                        `$${h.current.toLocaleString()}`
                      )}
                    </p>
                    <p className="hidden md:block text-right text-[11px] text-foreground/70 tabular-nums">${h.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <div className="text-right flex items-center justify-end gap-1">
                      {h.isEstimated ? (
                        <span className="text-[11px] text-muted-foreground/30 tabular-nums">—</span>
                      ) : (
                        <>
                          {positive ? <TrendingUp className="h-3 w-3 text-bull/60" /> : <TrendingDown className="h-3 w-3 text-bear/60" />}
                          <span className={`text-[11px] font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                            {positive ? '+' : ''}{pnlPct.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="hidden md:flex items-center justify-end gap-1.5">
                      <span className="text-[11px] text-muted-foreground/40 tabular-nums">{h.allocation}%</span>
                      <button
                        onClick={() => removeHolding(h.id)}
                        className="text-muted-foreground/20 hover:text-bear transition-colors ml-1"
                        title="Remove holding"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
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
                <PieChart className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Allocation</h2>
              </div>
              {holdingsWithAlloc.length > 0 ? (
                <>
                  <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
                    {holdingsWithAlloc.map((h, i) => (
                      <div
                        key={h.symbol}
                        className={`${allocationColors[i % allocationColors.length]} transition-all duration-500`}
                        style={{ width: `${h.allocation}%` }}
                        title={`${h.symbol}: ${h.allocation}%`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {holdingsWithAlloc.map((h, i) => (
                      <div key={h.symbol} className="flex items-center gap-2 py-0.5">
                        <div className={`h-2 w-2 rounded-full ${allocationColors[i % allocationColors.length]}`} />
                        <span className="text-[9px] text-muted-foreground/40">{h.symbol}</span>
                        <span className="text-[10px] font-semibold text-foreground ml-auto tabular-nums">{h.allocation}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground/30 text-center py-4">No holdings</p>
              )}
            </div>

            {/* Best & Worst — only show when we have live prices */}
            {best && !best.isEstimated && (
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-3.5 w-3.5 text-bull/70" />
                  <h2 className="section-header text-foreground/80">Best Performer</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{best.symbol}</p>
                    <p className="text-[9px] text-muted-foreground/35">{best.name !== best.symbol ? best.name : ''}</p>
                  </div>
                  <span className="text-[15px] font-bold text-bull tabular-nums value-bull">
                    +{(((best.current - best.avgCost) / best.avgCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {worst && worst.symbol !== best?.symbol && !worst.isEstimated && (
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-bear/70" />
                  <h2 className="section-header text-foreground/80">Weakest Position</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{worst.symbol}</p>
                    <p className="text-[9px] text-muted-foreground/35">{worst.name !== worst.symbol ? worst.name : ''}</p>
                  </div>
                  <span className={`text-[15px] font-bold tabular-nums ${((worst.current - worst.avgCost) / worst.avgCost) >= 0 ? 'text-bull value-bull' : 'text-bear value-bear'}`}>
                    {((worst.current - worst.avgCost) / worst.avgCost) >= 0 ? '+' : ''}
                    {(((worst.current - worst.avgCost) / worst.avgCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
