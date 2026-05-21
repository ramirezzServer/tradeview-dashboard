import { useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Eye, TrendingUp, TrendingDown, Search, Star,
  ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Plus, X, Loader2,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Input } from '@/components/ui/input';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import { SETTINGS_DEFAULTS, useSettings } from '@/hooks/useSettings';
import { useFinnhubCandles } from '@/hooks/useFinnhubCandles';
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
type SortBy = 'Symbol' | 'Change' | 'Volume';
type FlashDirection = 'bull' | 'bear';

const normalizeSortBy = (value: string | undefined): SortBy =>
  value === 'Symbol' || value === 'Change' ? value : 'Change';

function Sparkline({ symbol }: { symbol: string }) {
  const { data, isLive } = useFinnhubCandles(symbol, '1M', 'D');
  const sparkData = data.slice(-20).map(item => ({ close: item.close }));

  if (!isLive || sparkData.length === 0) {
    return <span className="text-app-xs text-muted-foreground/25">—</span>;
  }

  const first = sparkData[0]?.close ?? 0;
  const last = sparkData[sparkData.length - 1]?.close ?? first;
  const stroke = last >= first ? 'hsl(var(--bull))' : 'hsl(var(--bear))';

  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={sparkData}>
        <Line type="monotone" dataKey="close" stroke={stroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const Watchlist = () => {
  const { settings } = useSettings();
  const { items, isLoading: listLoading, addSymbol, removeItem, isAdding, addError } = useWatchlist();
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<FilterTab>('all');
  const [addInput, setAddInput]       = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [localAddError, setLocalAddError] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(normalizeSortBy(SETTINGS_DEFAULTS.watchlist_prefs?.sort_by));
  const [livePriceUpdates, setLivePriceUpdates] = useState(SETTINGS_DEFAULTS.watchlist_prefs?.live_price_updates ?? true);
  const [flashAnimations, setFlashAnimations] = useState(SETTINGS_DEFAULTS.watchlist_prefs?.flash_animations ?? true);
  const [showSparklines, setShowSparklines] = useState(SETTINGS_DEFAULTS.watchlist_prefs?.show_sparklines ?? true);
  const [flashDirections, setFlashDirections] = useState<Record<string, FlashDirection>>({});
  const previousPrices = useRef<Record<string, number>>({});
  const watchlistPrefs = settings?.watchlist_prefs;
  const preferredSortBy = normalizeSortBy(watchlistPrefs?.sort_by);
  const preferredLivePriceUpdates = watchlistPrefs?.live_price_updates ?? SETTINGS_DEFAULTS.watchlist_prefs!.live_price_updates!;
  const preferredFlashAnimations = watchlistPrefs?.flash_animations ?? SETTINGS_DEFAULTS.watchlist_prefs!.flash_animations!;
  const preferredShowSparklines = watchlistPrefs?.show_sparklines ?? SETTINGS_DEFAULTS.watchlist_prefs!.show_sparklines!;

  useEffect(() => {
    setSortBy(preferredSortBy);
    setLivePriceUpdates(preferredLivePriceUpdates);
    setFlashAnimations(preferredFlashAnimations);
    setShowSparklines(preferredShowSparklines);
  }, [
    preferredSortBy,
    preferredLivePriceUpdates,
    preferredFlashAnimations,
    preferredShowSparklines,
  ]);

  // ── Live quotes from unified market data layer ────────────────────────────
  const symbols = items.map(i => i.symbol);
  const { quotes, liveCount } = useMarketQuotes(symbols, livePriceUpdates);

  useEffect(() => {
    if (!flashAnimations) {
      previousPrices.current = Object.fromEntries(
        Object.entries(quotes).map(([symbol, quote]) => [symbol, quote.price])
      );
      setFlashDirections({});
      return;
    }

    const nextFlashes: Record<string, FlashDirection> = {};
    for (const [symbol, quote] of Object.entries(quotes)) {
      if (quote.status !== 'live') continue;
      const previous = previousPrices.current[symbol];
      if (previous !== undefined && previous !== quote.price) {
        nextFlashes[symbol] = quote.price > previous ? 'bull' : 'bear';
      }
      previousPrices.current[symbol] = quote.price;
    }

    if (Object.keys(nextFlashes).length === 0) return;
    setFlashDirections(current => ({ ...current, ...nextFlashes }));
    const timeout = window.setTimeout(() => {
      setFlashDirections(current => {
        const next = { ...current };
        Object.keys(nextFlashes).forEach(symbol => delete next[symbol]);
        return next;
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [quotes, flashAnimations]);

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

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'Symbol') return a.symbol.localeCompare(b.symbol);
      return (quotes[b.symbol]?.changePercent ?? Number.NEGATIVE_INFINITY) -
        (quotes[a.symbol]?.changePercent ?? Number.NEGATIVE_INFINITY);
    });
  }, [filteredItems, quotes, sortBy]);

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
      <div className="p-density-card space-density-section">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-density-section">
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
              className="glass-card-hover rounded-xl p-density-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-app-xs uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">
                  {c.label}
                </p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <c.icon className="h-3.5 w-3.5 text-primary/70" />
                </div>
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${c.color ?? 'text-foreground'}`}>
                {c.value}
              </p>
              {c.sub && <p className="text-app-xs text-muted-foreground/30 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="glass-card rounded-xl p-density-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-density-section">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 h-9 bg-secondary/30 border-border/20 text-app-sm placeholder:text-muted-foreground/25"
              />
            </div>
            <div className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-app-xs font-semibold transition-all duration-200 ${
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
          <div className="px-density-card py-density-row flex items-center gap-density-row border-b border-border/15">
            <Star className="h-3.5 w-3.5 text-primary/70" />
            <h2 className="section-header text-foreground/80">Active Watchlist</h2>
            <div className="ml-auto flex items-center gap-2">
              {liveCount > 0 ? (
                <span className="flex items-center gap-1 text-app-xs text-bull/60 font-medium">
                  <Wifi className="h-2.5 w-2.5" /> {liveCount}/{symbols.length} Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-app-xs text-muted-foreground/30 font-medium">
                  <WifiOff className="h-2.5 w-2.5" /> Offline
                </span>
              )}
              <span className="text-app-xs text-muted-foreground/30 tabular-nums">
                {sortedItems.length} assets
              </span>
              <button
                onClick={() => { setShowAddForm(v => !v); setLocalAddError(''); }}
                className="flex items-center gap-1 text-app-xs font-semibold text-primary/60 hover:text-primary border border-primary/12 hover:border-primary/25 rounded-md px-2 py-1 transition-all"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {/* Add symbol form */}
          {showAddForm && (
            <div className="px-density-card py-density-row border-b border-border/10 flex items-center gap-density-row">
              <Input
                value={addInput}
                onChange={e => setAddInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. AAPL"
                autoFocus
                className="h-8 w-40 bg-secondary/30 border-border/20 text-app-sm placeholder:text-muted-foreground/25 uppercase"
              />
              <button
                onClick={handleAdd}
                disabled={isAdding || !addInput.trim()}
                className="h-8 px-3 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground text-app-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {isAdding ? 'Adding…' : 'Add'}
              </button>
              {localAddError && <p className="text-app-xs text-bear">{localAddError}</p>}
            </div>
          )}

          {/* Table header */}
          <div className={`hidden md:grid ${showSparklines ? 'grid-cols-[2fr_1fr_1fr_80px_56px]' : 'grid-cols-[2fr_1fr_1fr_56px]'} gap-density-row px-density-card py-density-row text-app-xs uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10`}>
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h Change</span>
            {showSparklines && <span className="text-right">Trend</span>}
            <span className="text-right">Action</span>
          </div>

          {/* Loading state (list only) */}
          {listLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground/30">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!listLoading && sortedItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
              <Star className="h-6 w-6 mb-2 opacity-30" />
              <p className="text-app-sm">Your watchlist is empty</p>
              <p className="text-app-xs mt-0.5">Click "Add" to track a symbol</p>
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-border/8">
            {sortedItems.map((item, i) => {
              const q         = quotes[item.symbol];
              const live      = q?.status === 'live';
              const positive  = (q?.changePercent ?? 0) >= 0;
              const crypto    = isCryptoSymbol(item.symbol);
              const name      = symbolNames[item.symbol] ?? item.symbol;
              const flash     = flashDirections[item.symbol];

              const priceStr = live && q
                ? (crypto
                    ? `$${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : `$${q.price.toFixed(2)}`)
                : null;

              return (
                <div
                  key={item.symbol}
                  className={`grid grid-cols-2 ${showSparklines ? 'md:grid-cols-[2fr_1fr_1fr_80px_56px]' : 'md:grid-cols-[2fr_1fr_1fr_56px]'} gap-density-row items-center px-density-card py-density-row hover:bg-accent/15 transition-colors animate-fade-up ${flash === 'bull' ? 'flash-bull' : flash === 'bear' ? 'flash-bear' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Symbol / Name */}
                  <div className="flex items-center gap-density-row">
                    <div className="h-9 w-9 rounded-lg bg-secondary/40 border border-border/15 flex items-center justify-center shrink-0">
                      <span className="text-app-xs font-bold text-foreground/80">
                        {item.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-app-sm font-semibold text-foreground">{item.symbol}</p>
                        {live
                          ? <Wifi    className="h-2.5 w-2.5 text-bull/50 shrink-0" />
                          : <WifiOff className="h-2.5 w-2.5 text-muted-foreground/20 shrink-0" />
                        }
                      </div>
                      <p className="text-app-xs text-muted-foreground/35 truncate">{name}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <p className={`text-right text-app-sm font-bold tabular-nums ${priceStr ? 'text-foreground' : 'text-muted-foreground/25'}`}>
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
                        <span className={`text-app-sm font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                          {positive ? '+' : ''}{q.changePercent.toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-app-sm text-muted-foreground/25">—</span>
                    )}
                  </div>

                  {/* Sparkline (desktop) */}
                  {showSparklines && (
                    <div className="hidden md:block h-7">
                      <Sparkline symbol={item.symbol} />
                    </div>
                  )}

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
                      <p className={`text-app-sm font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                        {positive ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </p>
                    ) : (
                      <p className="text-app-sm text-muted-foreground/25">—</p>
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
