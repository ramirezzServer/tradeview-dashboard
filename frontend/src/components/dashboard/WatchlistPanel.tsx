import { TrendingUp, TrendingDown, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import { isCryptoSymbol } from '@/services/coingecko';

// ─── Known company names for display ─────────────────────────────────────────
// This is display metadata only — prices always come from live sources.
const KNOWN_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',     TSLA: 'Tesla Inc.',      NVDA: 'NVIDIA Corp.',
  MSFT: 'Microsoft',      AMZN: 'Amazon',          META: 'Meta Platforms',
  GOOGL: 'Alphabet Inc.', GOOG: 'Alphabet Inc.',   NFLX: 'Netflix',
  AMD:  'AMD',            INTC: 'Intel',            BABA: 'Alibaba',
  BTC:  'Bitcoin',        ETH:  'Ethereum',         SOL:  'Solana',
  BNB:  'Binance Coin',   XRP:  'Ripple',           DOGE: 'Dogecoin',
  AVAX: 'Avalanche',      DOT:  'Polkadot',         ADA:  'Cardano',
};

export function WatchlistPanel() {
  // ── Pull the user's actual watchlist from the backend ──────────────────────
  const { items, isLoading: listLoading } = useWatchlist();

  const symbols = useMemo(() => items.map(i => i.symbol), [items]);

  // ── Fetch live prices for all symbols (stocks via Finnhub, crypto via CoinGecko)
  const { quotes, isLoading: quotesLoading, liveCount } = useMarketQuotes(symbols);

  const isLoading = listLoading || (symbols.length > 0 && quotesLoading);
  const isLive    = liveCount > 0;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-density-card py-density-row flex items-center justify-between">
        <h3 className="section-header text-foreground/80">Watchlist</h3>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground/30" />
          ) : isLive ? (
            <span className="flex items-center gap-1 text-app-xs text-bull/60 font-medium">
              <Wifi className="h-2.5 w-2.5" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-app-xs text-muted-foreground/30 font-medium">
              <WifiOff className="h-2.5 w-2.5" /> Offline
            </span>
          )}
          <span className="text-app-xs text-muted-foreground/30 tabular-nums">{symbols.length} assets</span>
        </div>
      </div>

      {/* Empty state */}
      {!listLoading && items.length === 0 && (
        <p className="px-density-card pb-4 text-app-sm text-muted-foreground/30">
          No symbols in your watchlist yet.
        </p>
      )}

      <div className="px-2 pb-2 space-y-0.5">
        {items.map(item => {
          const sym   = item.symbol;
          const quote = quotes[sym];
          const name  = KNOWN_NAMES[sym] ?? sym;
          const isCrypto = isCryptoSymbol(sym);

          const price         = quote?.price         ?? 0;
          const changePercent = quote?.changePercent ?? 0;
          const positive      = changePercent >= 0;
          const isSymbolLive  = quote?.status === 'live';

          return (
            <div
              key={sym}
              className="group flex items-center justify-between rounded-lg px-3 py-density-row transition-all duration-250 hover:bg-accent/30 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-app-sm font-semibold text-foreground">{sym}</p>
                <p className="text-app-xs text-muted-foreground/40 truncate">{name}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  {isSymbolLive ? (
                    <>
                      <p className="text-app-sm font-bold text-foreground tabular-nums">
                        {isCrypto
                          ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : `$${price.toFixed(2)}`}
                      </p>
                      <p className={`text-app-xs font-semibold tabular-nums ${positive ? 'text-bull value-bull' : 'text-bear value-bear'}`}>
                        {positive ? '+' : ''}{changePercent.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <p className="text-app-sm text-muted-foreground/30">—</p>
                  )}
                </div>
                {isSymbolLive && (
                  positive
                    ? <TrendingUp className="h-3.5 w-3.5 text-bull/50" />
                    : <TrendingDown className="h-3.5 w-3.5 text-bear/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
