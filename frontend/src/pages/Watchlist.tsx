import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Eye, TrendingUp, TrendingDown, Search, Star,
  ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Plus, X, Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import { isCryptoSymbol } from '@/services/coingecko';

// ─── Static display names (no prices — prices come from live APIs) ────────────
const symbolNames: Record<string, string> = {
  AAPL:  'Apple Inc.',
  TSLA:  'Tesla Inc.',
  NVDA:  'NVIDIA Corp.',
  MSFT:  'Microsoft Corp.',
  AMZN:  'Amazon.com Inc.',
  META:  'Meta Platforms',
  GOOGL: 'Alphabet Inc.',
  BTC:   'Bitcoin',
  ETH:   'Ethereum',
  SOL:   'Solana',
  BNB:   'BNB',
  XRP:   'XRP',
  ADA:   'Cardano',
  DOGE:  'Dogecoin',
  DOT:   'Polkadot',
  AVAX:  'Avalanche',
  LINK:  'Chainlink',
  LTC:   'Litecoin',
  MATIC: 'Polygon',
  SHIB:  'Shiba Inu',
  UNI:   'Uniswap',
};

type FilterTab = 'all' | 'stocks' | 'crypto';

const Watchlist = () => {
  const { items, isLoading: listLoading, addSymbol, removeItem, isAdding, addError } = useWatchlist();
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<FilterTab>('all');
  const [addInput, setAddInput]       = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [localAddError, setLocalAddError] = useState('');

  // ── Live quotes from unified market data layer ────────────────────────────
  const symbols = items.map(i => i.symbol);
  const { quotes, liveCount } = useMarketQuotes(symbols);

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredItems = items.filter(item => {
    const name = symbolNames[item.symbol] ?? item.symbol;
    const matchesSearch =
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const assetType = isCryptoSymbol(item.symbol) ? 'crypto' : 'stock';
    const matchesFilter =
      filter === 'all' ||
      (filter === 'stocks' && assetType === 'stock') ||
      (filter === 'crypto' && assetType === 'crypto');
    return matchesSearch && matchesFilter;
  });

  // ── Summary values (computed from live quotes only) ───────────────────────
  const liveQuotes = Object.values(quotes).filter(q => q.status === 'live');
  const avgChange = liveQuotes.length > 0
    ? liveQuotes.reduce((sum, q) => sum + q.changePercent, 0) / liveQuotes.length
    : null;
  const bestPerformer = liveQuotes.length > 0
    ? liveQuotes.reduce((best, q) => q.changePercent > best.changePercent ? q : best)
    : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const sym = addInput.trim().toUpperCase();
    if (!sym) return;
    setLocalAddError('');
    try {
      await addSymbol(sym);
      setAddInput('');
      setShowAddForm(false);
    } catch {
      setLocalAddError(addError ?? 'Failed to add symbol.');
    }
  };

  const handleRemove = async (symbol: string) => {
    const item = items.find(i => i.symbol === symbol);
    if (item) await removeItem(item.id);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',    label: 'All'    },
    { key: 'stocks', label: 'Stocks' },
    { key: 'crypto', label: 'Crypto' },
  ];

  return (
    <DashboardLayout title="Watchlist">
      <div className="p-4 lg:p-6 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Total Assets',
              value: symbols.length.toString(),
              icon:  Eye,
              sub:   'Tracked',
              color: undefined as string | undefined,
            },
            {
              label: 'Avg Daily Change',
              value: avgChange !== null
                ? `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`
                : '—',
              icon:  avgChange !== null && avgChange >= 0 ? ArrowUpRight : ArrowDownRight,
              sub:   liveQuotes.length > 0
                ? `${liveQuotes.length} live symbol${liveQuotes.length !== 1 ? 's' : ''}`
                : 'No live data',
              color: avgChange !== null
                ? (avgChange >= 0 ? 'text-bull value-bull' : 'text-bear value-bear')
                : undefined,
            },
            {
              label: 'Best Performer',
              value: bestPerformer
                ? `${bestPerformer.symbol} ${bestPerformer.changePercent >= 0 ? '+' : ''}${bestPerformer.changePercent.toFixed(2)}%`
                : '—',
              icon:  TrendingUp,
              sub:   undefined as string | undefined,
              color: bestPerformer ? 'text-bull value-bull' : undefined,
            },
          ].map((c, i) => (
            <div
              key={c.label}
              className="glass-card-hover rounded-xl p-4 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">
                  {c.label}
                </p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <c.icon className="h-3.5 w-3.5 text-primary/70" />
                </div>
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${c.color ?? 'text-foreground'}`}>
                {c.value}
              </p>
              {c.sub && <p className="text-[9px] text-muted-foreground/30 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 h-9 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25"
              />
            </div>
            <div className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                    filter === t.key
                      ? 'bg-primary/12 text-primary border border-primary/15 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
            <Star className="h-3.5 w-3.5 text-primary/70" />
            <h2 className="section-header text-foreground/80">Active Watchlist</h2>
            <div className="ml-auto flex items-center gap-2">
              {liveCount > 0 ? (
                <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
                  <Wifi className="h-2.5 w-2.5" /> {liveCount}/{symbols.length} Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium">
                  <WifiOff className="h-2.5 w-2.5" /> Offline
                </span>
              )}
              <span className="text-[9px] text-muted-foreground/30 tabular-nums">
                {filteredItems.length} assets
              </span>
              <button
                onClick={() => { setShowAddForm(v => !v); setLocalAddError(''); }}
                className="flex items-center gap-1 text-[9px] font-semibold text-primary/60 hover:text-primary border border-primary/12 hover:border-primary/25 rounded-md px-2 py-1 transition-all"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {/* Add symbol form */}
          {showAddForm && (
            <div className="px-5 py-3 border-b border-border/10 flex items-center gap-2">
              <Input
                value={addInput}
                onChange={e => setAddInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. AAPL"
                autoFocus
                className="h-8 w-40 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25 uppercase"
              />
              <button
                onClick={handleAdd}
                disabled={isAdding || !addInput.trim()}
                className="h-8 px-3 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground text-[11px] font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {isAdding ? 'Adding…' : 'Add'}
              </button>
              {localAddError && <p className="text-[10px] text-bear">{localAddError}</p>}
            </div>
          )}

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_56px] gap-2 px-5 py-2.5 text-[8px] uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h Change</span>
            <span className="text-right">Action</span>
          </div>

          {/* Loading state (list only) */}
          {listLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground/30">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!listLoading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
              <Star className="h-6 w-6 mb-2 opacity-30" />
              <p className="text-[11px]">Your watchlist is empty</p>
              <p className="text-[9px] mt-0.5">Click "Add" to track a symbol</p>
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-border/8">
            {filteredItems.map((item, i) => {
              const q         = quotes[item.symbol];
              const live      = q?.status === 'live';
              const positive  = (q?.changePercent ?? 0) >= 0;
              const crypto    = isCryptoSymbol(item.symbol);
              const name      = symbolNames[item.symbol] ?? item.symbol;

              const priceStr = live && q
                ? (crypto
                    ? `$${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : `$${q.price.toFixed(2)}`)
                : null;

              return (
                <div
                  key={item.symbol}
                  className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_56px] gap-2 items-center px-5 py-3 hover:bg-accent/15 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Symbol / Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary/40 border border-border/15 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-foreground/80">
                        {item.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold text-foreground">{item.symbol}</p>
                        {live
                          ? <Wifi    className="h-2.5 w-2.5 text-bull/50 shrink-0" />
                          : <WifiOff className="h-2.5 w-2.5 text-muted-foreground/20 shrink-0" />
                        }
                      </div>
                      <p className="text-[9px] text-muted-foreground/35 truncate">{name}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <p className={`text-right text-[13px] font-bold tabular-nums ${priceStr ? 'text-foreground' : 'text-muted-foreground/25'}`}>
                    {priceStr ?? '—'}
                  </p>

                  {/* Change (desktop) */}
                  <div className="hidden md:flex items-center justify-end gap-1.5">
                    {live && q ? (
                      <>
                        {positive
                          ? <TrendingUp   className="h-3 w-3 text-bull/60" />
                          : <TrendingDown className="h-3 w-3 text-bear/60" />
                        }
                        <span className={`text-[11px] font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                          {positive ? '+' : ''}{q.changePercent.toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/25">—</span>
                    )}
                  </div>

                  {/* Action (desktop) */}
                  <div className="hidden md:flex justify-end">
                    <button
                      onClick={() => handleRemove(item.symbol)}
                      className="text-muted-foreground/30 hover:text-bear border border-transparent hover:border-bear/20 rounded-md p-1.5 transition-all"
                      title="Remove from watchlist"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Change (mobile) */}
                  <div className="md:hidden text-right">
                    {live && q ? (
                      <p className={`text-[11px] font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                        {positive ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/25">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
