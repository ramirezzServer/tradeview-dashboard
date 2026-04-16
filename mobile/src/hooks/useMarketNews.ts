import { useQuery } from '@tanstack/react-query';
import { fetchMarketNews } from '../services/market';
import type { NewsItem } from '../types/market';

export function useMarketNews(category = 'general') {
  const query = useQuery<NewsItem[], Error>({
    queryKey:        ['market-news', category],
    queryFn:         () => fetchMarketNews(category),
    staleTime:        5 * 60_000,
    refetchInterval:  10 * 60_000,
    retry: 1,
  });

  return {
    news:      query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error instanceof Error ? query.error.message : null,
    refetch:   query.refetch,
  };
}
