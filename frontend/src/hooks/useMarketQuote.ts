// ─── useMarketQuote ───────────────────────────────────────────────────────────
// React Query wrapper for a single stock quote.
//
// Advantages over the legacy useFinnhubQuote hook:
//  • Deduplication: multiple components watching the same symbol share one request
//  • Automatic background refresh (refetchInterval)
//  • Proper staleTime so we don't over-fetch
//  • Consistent loading / error states via React Query
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { getQuote, isFinnhubConfigured, type FinnhubQuote } from '@/services/finnhub';

export interface MarketQuoteResult {
  data:    FinnhubQuote | undefined;
  isLoading: boolean;
  isError:   boolean;
  error:     Error | null;
  /** True only when we have a valid quote with a non-zero price */
  isLive:  boolean;
  /** ISO string of last successful fetch, or null */
  lastUpdated: string | null;
}

export function useMarketQuote(
  symbol: string,
  options: { enabled?: boolean; refetchIntervalMs?: number } = {}
): MarketQuoteResult {
  const { enabled = true, refetchIntervalMs = 15_000 } = options;

  const query = useQuery<FinnhubQuote, Error>({
    queryKey: ['quote', symbol.toUpperCase()],
    queryFn:  () => getQuote(symbol.toUpperCase()),
    enabled:  enabled && isFinnhubConfigured() && !!symbol,
    staleTime: 10_000,                    // 10s — data is considered fresh
    refetchInterval: refetchIntervalMs,   // auto-refresh in foreground
    refetchIntervalInBackground: false,   // pause when tab is hidden
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8_000),
  });

  const data    = query.data;
  const isLive  = !!data && data.c > 0;
  const lastUpdated = isLive && data?.t ? new Date(data.t * 1000).toISOString() : null;

  return {
    data,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    isLive,
    lastUpdated,
  };
}
