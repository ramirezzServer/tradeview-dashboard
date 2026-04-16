import { useQuery } from '@tanstack/react-query';
import { fetchQuote } from '../services/market';
import type { Quote } from '../types/market';

interface UseMarketQuoteOptions {
  enabled?:          boolean;
  refetchIntervalMs?: number;
}

export function useMarketQuote(
  symbol: string,
  { enabled = true, refetchIntervalMs = 15_000 }: UseMarketQuoteOptions = {},
) {
  const query = useQuery<Quote, Error>({
    queryKey:        ['quote', symbol.toUpperCase()],
    queryFn:         () => fetchQuote(symbol),
    enabled:         enabled && !!symbol,
    staleTime:        10_000,
    refetchInterval: refetchIntervalMs,
    refetchIntervalInBackground: false,
    retry:           2,
    retryDelay:      (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
  });

  const data    = query.data;
  const isLive  = !!data && data.c > 0;
  const lastUpdated = isLive && data?.t
    ? new Date(data.t * 1000).toISOString()
    : null;

  return {
    data,
    isLoading:   query.isLoading,
    isError:     query.isError,
    error:       query.error,
    isLive,
    lastUpdated,
    refetch:     query.refetch,
  };
}
