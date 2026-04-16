import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPrices } from '../services/market';
import type { CryptoPrice } from '../types/market';

export function useCryptoPrices(symbols: string[] = ['BTC', 'ETH', 'SOL']) {
  const query = useQuery<CryptoPrice[], Error>({
    queryKey:        ['crypto-prices', symbols.join(',')],
    queryFn:         () => fetchCryptoPrices(symbols),
    staleTime:        60_000,         // 1 min
    refetchInterval:  60_000,
    refetchIntervalInBackground: false,
    retry: 2,
  });

  return {
    prices:    query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error instanceof Error ? query.error.message : null,
    refetch:   query.refetch,
    /** Quick lookup by symbol */
    getBySymbol: (sym: string) =>
      (query.data ?? []).find((p) => p.symbol === sym.toUpperCase()),
  };
}
