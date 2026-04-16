import { useQuery } from '@tanstack/react-query';
import { fetchMarketMovers } from '../services/market';
import type { MarketMoversData } from '../types/market';

export function useMarketMovers() {
  const query = useQuery<MarketMoversData, Error>({
    queryKey:        ['market-movers'],
    queryFn:         fetchMarketMovers,
    staleTime:        5 * 60_000,    // 5 min — matches backend cache
    refetchInterval:  5 * 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return {
    data:      query.data ?? null,
    isLoading: query.isLoading,
    isError:   query.isError,
    isLive:    !!query.data && !query.isError,
    error:     query.error instanceof Error ? query.error.message : null,
    refetch:   query.refetch,
  };
}
