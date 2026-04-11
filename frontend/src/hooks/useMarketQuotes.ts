// ─── useMarketQuotes ──────────────────────────────────────────────────────────
// Batch market data hook that fetches quotes for a mixed list of stocks and
// crypto symbols, normalizes them into a single unified shape, and exposes a
// consistent live/unavailable status per symbol.
//
// Stocks  → Finnhub /api/market/quote/{symbol}     (via React Query per-symbol)
// Crypto  → CoinGecko /api/market/crypto/prices    (one request for all)
//
// Both sources share the same normalized NormalizedQuote interface so components
// do not need to branch on asset class.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useQueries } from '@tanstack/react-query';
import { getQuote, isFinnhubConfigured } from '@/services/finnhub';
import { getCryptoPrices, isCryptoSymbol } from '@/services/coingecko';

// ─── Unified quote shape ──────────────────────────────────────────────────────

export type QuoteSource = 'finnhub' | 'coingecko' | 'unavailable';
export type QuoteStatus = 'live' | 'simulated' | 'unavailable';

export interface NormalizedQuote {
  symbol:        string;
  price:         number;
  change:        number;   // 24h / daily $ change
  changePercent: number;   // 24h / daily % change
  source:        QuoteSource;
  status:        QuoteStatus;
  error?:        string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketQuotes(symbols: string[]) {
  const stockSymbols  = symbols.filter(s => !isCryptoSymbol(s));
  const cryptoSymbols = symbols.filter(s => isCryptoSymbol(s));
  const configured    = isFinnhubConfigured();

  // Individual queries for each stock symbol — React Query deduplicates
  // automatically when the same symbol is requested from multiple components.
  const stockQueries = useQueries({
    queries: stockSymbols.map(sym => ({
      queryKey: ['quote', sym.toUpperCase()],
      queryFn:  () => getQuote(sym.toUpperCase()),
      enabled:  configured && !!sym,
      staleTime:     10_000,
      refetchInterval: 15_000,
      refetchIntervalInBackground: false,
      retry: 1,
    })),
  });

  // Single batched query for all crypto symbols to avoid N separate CoinGecko calls.
  const cryptoQuery = useQuery({
    queryKey: ['crypto-prices', [...cryptoSymbols].sort().join(',')],
    queryFn:  () => getCryptoPrices(cryptoSymbols),
    enabled:  cryptoSymbols.length > 0,
    staleTime:       25_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  // ── Normalize into a unified map ──────────────────────────────────────────

  const quotes: Record<string, NormalizedQuote> = {};

  stockSymbols.forEach((sym, idx) => {
    const q = stockQueries[idx];
    if (q.data && q.data.c > 0) {
      quotes[sym] = {
        symbol:        sym,
        price:         q.data.c,
        change:        q.data.d,
        changePercent: q.data.dp,
        source:        'finnhub',
        status:        'live',
      };
    } else if (q.isError || (q.data && q.data.c === 0)) {
      quotes[sym] = {
        symbol:        sym,
        price:         0,
        change:        0,
        changePercent: 0,
        source:        'unavailable',
        status:        'unavailable',
        error:         q.error instanceof Error ? q.error.message : 'No data',
      };
    }
  });

  if (cryptoQuery.data) {
    for (const [sym, cq] of Object.entries(cryptoQuery.data)) {
      if (cq.c > 0) {
        quotes[sym] = {
          symbol:        sym,
          price:         cq.c,
          change:        cq.d,
          changePercent: cq.dp,
          source:        'coingecko',
          status:        'live',
        };
      }
    }
  }

  // Crypto symbols with no data from CoinGecko get an explicit unavailable entry
  cryptoSymbols.forEach(sym => {
    if (!quotes[sym] && (cryptoQuery.isError || cryptoQuery.isFetched)) {
      quotes[sym] = {
        symbol:        sym,
        price:         0,
        change:        0,
        changePercent: 0,
        source:        'unavailable',
        status:        'unavailable',
        error:         'Crypto price unavailable',
      };
    }
  });

  const isLoading  = stockQueries.some(q => q.isLoading) || cryptoQuery.isLoading;
  const liveCount  = Object.values(quotes).filter(q => q.status === 'live').length;

  return {
    quotes,
    isLoading,
    liveCount,
    totalRequested: symbols.length,
  };
}
