import { useState, useMemo, FormEvent } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Briefcase, TrendingUp, TrendingDown, Wallet,
  PieChart, Award, AlertTriangle, Plus, X, Loader2, RefreshCw, Pencil, Check,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import { isCryptoSymbol } from '@/services/coingecko';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';

const allocationColors = [
  'bg-primary', 'bg-chart-accent', 'bg-bull', 'bg-primary/70',
  'bg-chart-accent/70', 'bg-bull/70', 'bg-bear/50', 'bg-muted-foreground/40',
];

// ─── Add Holding Form ─────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd:    (symbol: string, quantity: number, avgCost: number) => Promise<void>;
  isAdding: boolean;
  error:    string | null;
  onCancel: () => void;
}

function AddHoldingForm({ onAdd, isAdding, error, onCancel }: AddFormProps) {
  const [symbol,   setSymbol]   = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost,  setAvgCost]  = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    const qty  = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    if (!symbol.trim()) next.symbol = 'Symbol is required.';
    if (!Number.isFinite(qty) || qty <= 0) next.quantity = 'Quantity must be a positive number.';
    if (!Number.isFinite(cost) || cost <= 0) next.avgCost = 'Average cost must be a positive number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const qty  = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    try {
      await onAdd(symbol.trim().toUpperCase(), qty, cost);
    } catch {
      setErrors({ form: error ?? 'Failed to add holding.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-density-card py-density-row border-b border-border/10 bg-accent/5">
      <p className="text-app-xs text-muted-foreground/50 uppercase tracking-widest font-semibold mb-3">New Holding</p>
      <div className="flex flex-wrap items-end gap-density-row">
        <div>
          <label className="text-app-xs text-muted-foreground/40 mb-1 block">Symbol</label>
          <Input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9.-]/g, '').slice(0, 12))}
            placeholder="AAPL"
            className="h-8 w-24 bg-secondary/30 border-border/20 text-app-sm placeholder:text-muted-foreground/25 uppercase"
            required
            autoFocus
          />
          {errors.symbol && <p className="text-app-xs text-bear mt-1">{errors.symbol}</p>}
        </div>
        <div>
          <label className="text-app-xs text-muted-foreground/40 mb-1 block">Shares</label>
          <Input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="10"
            min="0.000001"
            step="any"
            className="h-8 w-24 bg-secondary/30 border-border/20 text-app-sm placeholder:text-muted-foreground/25"
            required
          />
          {errors.quantity && <p className="text-app-xs text-bear mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label className="text-app-xs text-muted-foreground/40 mb-1 block">Avg Cost ($)</label>
          <Input
            type="number"
            value={avgCost}
            onChange={e => setAvgCost(e.target.value)}
            placeholder="150.00"
            min="0.0001"
            step="any"
            className="h-8 w-28 bg-secondary/30 border-border/20 text-app-sm placeholder:text-muted-foreground/25"
            required
          />
          {errors.avgCost && <p className="text-app-xs text-bear mt-1">{errors.avgCost}</p>}
        </div>
        <button
          type="submit"
          disabled={isAdding}
          className="h-8 px-3 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground text-app-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
        >
          {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {isAdding ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-lg text-muted-foreground/40 hover:text-foreground text-app-sm transition-colors"
        >
          Cancel
        </button>
        {(errors.form || error) && (
          <p className="text-app-xs text-bear w-full">{errors.form || error}</p>
        )}
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Portfolio = () => {
  const { items, isLoading, addHolding, removeHolding, updateHolding, isAdding, addError } = usePortfolio();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editAvgCost, setEditAvgCost] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  // ── Unified live quotes (stocks via Finnhub, crypto via CoinGecko) ─────────
  // Deduplicates with watchlist panel and dashboard widgets automatically.
  const symbols = useMemo(
    () => [...new Set(items.map(i => i.symbol))],
    [items]
  );
  const { quotes, isLoading: quotesLoading, liveCount } = useMarketQuotes(symbols);

  // Force-invalidate all quote caches so React Query re-fetches immediately
  const refreshPrices = () => {
    symbols.forEach(sym => {
      qc.invalidateQueries({ queryKey: ['quote', sym] });
    });
    if (symbols.some(isCryptoSymbol)) {
      qc.invalidateQueries({ queryKey: ['crypto-prices'] });
    }
  };

  // ── Build display-ready holdings ──────────────────────────────────────────
  const holdings = useMemo(() => items.map(item => {
    const q        = quotes[item.symbol];
    const avgCost  = Number(item.average_cost);
    const livePrice = q?.status === 'live' ? q.price : null;
    const current   = livePrice ?? avgCost;
    return {
      id:          item.id,
      symbol:      item.symbol,
      name:        item.notes ?? item.symbol,
      shares:      item.quantity,
      avgCost,
      current,
      isEstimated: livePrice === null,
    };
  }), [items, quotes]);

  const totalValue  = holdings.reduce((s, h) => s + h.shares * h.current, 0);
  const totalCost   = holdings.reduce((s, h) => s + h.shares * h.avgCost,  0);
  const totalPnL    = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const holdingsWithAlloc = useMemo(() => holdings.map(h => ({
    ...h,
    value:      h.shares * h.current,
    allocation: totalValue > 0
      ? Math.round((h.shares * h.current / totalValue) * 100)
      : 0,
  })), [holdings, totalValue]);

  const quotesLive = liveCount > 0;

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

  const startEdit = (holding: { id: number; shares: number; avgCost: number }) => {
    setEditingId(holding.id);
    setEditQuantity(String(holding.shares));
    setEditAvgCost(String(holding.avgCost));
    setEditErrors({});
  };

  const saveEdit = async (id: number) => {
    const quantity = parseFloat(editQuantity);
    const averageCost = parseFloat(editAvgCost);
    const nextErrors: Record<string, string> = {};
    if (!Number.isFinite(quantity) || quantity <= 0) nextErrors.quantity = 'Quantity must be positive.';
    if (!Number.isFinite(averageCost) || averageCost <= 0) nextErrors.averageCost = 'Average cost must be positive.';
    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await updateHolding(id, { quantity, average_cost: averageCost });
    setEditingId(null);
    setEditErrors({});
  };

  const anyEstimated = holdings.some(h => h.isEstimated);

  return (
    <DashboardLayout title="Portfolio">
      <div className="p-density-card space-density-section">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-density-section">
          {[
            {
              label: 'Total Value',
              value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: Wallet,
            },
            {
              label: 'Total P/L',
              value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
              color: totalPnL >= 0 ? 'text-bull value-bull' : 'text-bear value-bear',
              sub: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`,
            },
            {
              label: 'Total Holdings',
              value: holdings.length.toString(),
              icon: Briefcase,
              sub: 'Active positions',
            },
            {
              label: 'Total Cost',
              value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: Wallet,
            },
          ].map((c, i) => (
            <div key={c.label} className="glass-card-hover rounded-xl p-density-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <p className="text-app-xs uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{c.label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <c.icon className="h-3.5 w-3.5 text-primary/70" />
                </div>
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${c.color || 'text-foreground'}`}>{c.value}</p>
              {c.sub && <p className="text-app-xs text-muted-foreground/30 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-density-section">
          {/* Holdings Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-density-card py-density-row flex items-center gap-density-row border-b border-border/15">
              <Briefcase className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Holdings</h2>

              {/* Live/estimated price badge */}
              <div className="flex items-center gap-1 ml-1">
                {quotesLoading ? (
                  <span className="flex items-center gap-1 text-app-xs text-muted-foreground/40">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Fetching prices…
                  </span>
                ) : quotesLive ? (
                  <span className="text-app-xs text-bull/60 font-medium">● Live prices</span>
                ) : items.length > 0 ? (
                  <span className="text-app-xs text-muted-foreground/40 font-medium">● Prices unavailable — showing cost basis</span>
                ) : null}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {!quotesLoading && items.length > 0 && (
                  <button
                    onClick={refreshPrices}
                    className="text-muted-foreground/30 hover:text-primary transition-colors"
                    title="Refresh prices"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="flex items-center gap-1 text-app-xs font-semibold text-primary/60 hover:text-primary border border-primary/12 hover:border-primary/25 rounded-md px-2 py-1 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            </div>

            {/* Disclaimer when any price is estimated */}
            {anyEstimated && !quotesLoading && (
              <div className="px-density-card py-density-row border-b border-border/10 bg-bear/5">
                <p className="text-app-xs text-bear/60">
                  Some prices could not be fetched (marked ~). Current value and P/L use your average cost for those positions.
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

            <div className="hidden md:grid grid-cols-7 gap-density-row px-density-card py-density-row text-app-xs uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
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
                <p className="text-app-sm">No holdings yet</p>
                <p className="text-app-xs mt-0.5">Click "Add" to track a position</p>
              </div>
            )}

            <div className="divide-y divide-border/8">
              {holdingsWithAlloc.map((h, i) => {
                const pnl      = (h.current - h.avgCost) * h.shares;
                const pnlPct   = h.avgCost > 0 ? ((h.current - h.avgCost) / h.avgCost) * 100 : 0;
                const positive = pnl >= 0;
                const editing = editingId === h.id;
                return (
                  <div
                    key={h.id}
                    className="grid grid-cols-3 md:grid-cols-7 gap-density-row items-center px-density-card py-density-row hover:bg-accent/15 transition-colors animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-app-sm font-semibold text-foreground">{h.symbol}</p>
                        <p className="text-app-xs text-muted-foreground/35">{h.name !== h.symbol ? h.name : ''}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex justify-end">
                      {editing ? (
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={e => setEditQuantity(e.target.value)}
                          className={`h-7 w-20 bg-secondary/30 text-app-xs text-right ${editErrors.quantity ? 'border-bear/50' : 'border-border/20'}`}
                          min="0.000001"
                          step="any"
                        />
                      ) : (
                        <p className="text-app-sm text-foreground/70 tabular-nums">{h.shares}</p>
                      )}
                    </div>
                    <div className="hidden md:flex justify-end">
                      {editing ? (
                        <Input
                          type="number"
                          value={editAvgCost}
                          onChange={e => setEditAvgCost(e.target.value)}
                          className={`h-7 w-24 bg-secondary/30 text-app-xs text-right ${editErrors.averageCost ? 'border-bear/50' : 'border-border/20'}`}
                          min="0.0001"
                          step="any"
                        />
                      ) : (
                        <p className="text-app-sm text-muted-foreground/50 tabular-nums">${h.avgCost.toLocaleString()}</p>
                      )}
                    </div>
                    <p className="text-right text-app-sm font-semibold text-foreground tabular-nums">
                      {h.isEstimated ? (
                        <span className="text-muted-foreground/40" title="Live price unavailable — showing cost basis">
                          ~${isCryptoSymbol(h.symbol)
                            ? h.current.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : h.current.toLocaleString()}
                        </span>
                      ) : (
                        isCryptoSymbol(h.symbol)
                          ? `$${h.current.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : `$${h.current.toLocaleString()}`
                      )}
                    </p>
                    <p className="hidden md:block text-right text-app-sm text-foreground/70 tabular-nums">
                      ${h.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="text-right flex items-center justify-end gap-1">
                      {h.isEstimated ? (
                        <span className="text-app-sm text-muted-foreground/30 tabular-nums">—</span>
                      ) : (
                        <>
                          {positive
                            ? <TrendingUp   className="h-3 w-3 text-bull/60" />
                            : <TrendingDown className="h-3 w-3 text-bear/60" />
                          }
                          <span className={`text-app-sm font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                            {positive ? '+' : ''}{pnlPct.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="hidden md:flex items-center justify-end gap-1.5">
                      <span className="text-app-sm text-muted-foreground/40 tabular-nums">{h.allocation}%</span>
                      {editing ? (
                        <>
                          <button
                            onClick={() => saveEdit(h.id)}
                            className="text-muted-foreground/30 hover:text-bull transition-colors ml-1"
                            title="Save holding"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-muted-foreground/30 hover:text-foreground transition-colors"
                            title="Cancel edit"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(h)}
                          className="text-muted-foreground/20 hover:text-primary transition-colors ml-1"
                          title="Edit holding"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => removeHolding(h.id)}
                        className="text-muted-foreground/20 hover:text-bear transition-colors"
                        title="Remove holding"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {editingId !== null && (editErrors.quantity || editErrors.averageCost) && (
              <p className="px-density-card py-density-row text-app-xs text-bear border-t border-border/10">
                {editErrors.quantity ?? editErrors.averageCost}
              </p>
            )}
          </div>

          {/* Right Column */}
          <div className="space-density-section">
            {/* Allocation */}
            <div className="glass-card rounded-xl p-density-card">
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
                        <span className="text-app-xs text-muted-foreground/40">{h.symbol}</span>
                        <span className="text-app-xs font-semibold text-foreground ml-auto tabular-nums">{h.allocation}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-app-sm text-muted-foreground/30 text-center py-4">No holdings</p>
              )}
            </div>

            {/* Best & Worst — only show when we have live prices */}
            {best && !best.isEstimated && (
              <div className="glass-card rounded-xl p-density-card">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-3.5 w-3.5 text-bull/70" />
                  <h2 className="section-header text-foreground/80">Best Performer</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-app-sm font-bold text-foreground">{best.symbol}</p>
                    <p className="text-app-xs text-muted-foreground/35">{best.name !== best.symbol ? best.name : ''}</p>
                  </div>
                  <span className="text-app-md font-bold text-bull tabular-nums value-bull">
                    +{(((best.current - best.avgCost) / best.avgCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {worst && worst.symbol !== best?.symbol && !worst.isEstimated && (
              <div className="glass-card rounded-xl p-density-card">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-bear/70" />
                  <h2 className="section-header text-foreground/80">Weakest Position</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-app-sm font-bold text-foreground">{worst.symbol}</p>
                    <p className="text-app-xs text-muted-foreground/35">{worst.name !== worst.symbol ? worst.name : ''}</p>
                  </div>
                  <span className={`text-app-md font-bold tabular-nums ${((worst.current - worst.avgCost) / worst.avgCost) >= 0 ? 'text-bull value-bull' : 'text-bear value-bear'}`}>
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
