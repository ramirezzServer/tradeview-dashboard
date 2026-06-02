import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuotes, isFinnhubConfigured } from '@/services/finnhub';
import { getCryptoPrices, isCryptoSymbol } from '@/services/coingecko';
import { queryFreshness, queryGc, retryUnlessClientError } from '@/lib/queryOptions';

export type QuoteSource = 'finnhub' | 'coingecko' | 'unavailable';
export type QuoteStatus = 'live' | 'simulated' | 'unavailable';

export interface NormalizedQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  source: QuoteSource;
  status: QuoteStatus;
  fetchedAt: number;
  error?: string;
}

export function useMarketQuotes(symbols: string[], liveUpdates = true) {
  const uniqueSymbols = useMemo(
    () => [...new Set(symbols.map(s => s.toUpperCase().trim()).filter(Boolean))],
    [symbols]
  );
  const stockSymbols = useMemo(() => uniqueSymbols.filter(s => !isCryptoSymbol(s)), [uniqueSymbols]);
  const cryptoSymbols = useMemo(() => uniqueSymbols.filter(s => isCryptoSymbol(s)), [uniqueSymbols]);
  const configured = isFinnhubConfigured();
  const stockKey = useMemo(() => [...stockSymbols].sort().join(','), [stockSymbols]);
  const cryptoKey = useMemo(() => [...cryptoSymbols].sort().join(','), [cryptoSymbols]);

  const stockQuery = useQuery({
    queryKey: ['quotes', stockKey],
    queryFn: ({ signal }) => getQuotes(stockSymbols, { signal }),
    enabled: configured && stockSymbols.length > 0,
    staleTime: queryFreshness.quoteBatch,
    gcTime: queryGc.short,
    refetchInterval: liveUpdates ? 20_000 : false,
    refetchIntervalInBackground: false,
    retry: retryUnlessClientError,
    placeholderData: previous => previous,
  });

  const cryptoQuery = useQuery({
    queryKey: ['crypto-prices', cryptoKey],
    queryFn: () => getCryptoPrices(cryptoSymbols),
    enabled: cryptoSymbols.length > 0,
    staleTime: queryFreshness.cryptoPrice,
    gcTime: queryGc.short,
    refetchInterval: liveUpdates ? 30_000 : false,
    refetchIntervalInBackground: false,
    retry: retryUnlessClientError,
    placeholderData: previous => previous,
  });

  const quotes = useMemo(() => {
    const nextQuotes: Record<string, NormalizedQuote> = {};

    stockSymbols.forEach(sym => {
      const result = stockQuery.data?.[sym];
      const quote = result?.quote;

      if (result?.success && quote && quote.c > 0) {
        nextQuotes[sym] = {
          symbol: sym,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          source: 'finnhub',
          status: 'live',
          fetchedAt: stockQuery.dataUpdatedAt || Date.now(),
        };
      } else if (result || stockQuery.isError) {
        nextQuotes[sym] = {
          symbol: sym,
          price: 0,
          change: 0,
          changePercent: 0,
          source: 'unavailable',
          status: 'unavailable',
          fetchedAt: stockQuery.dataUpdatedAt || Date.now(),
          error: result?.message ?? (stockQuery.error instanceof Error ? stockQuery.error.message : 'No data'),
        };
      }
    });

    if (cryptoQuery.data) {
      for (const [sym, cq] of Object.entries(cryptoQuery.data)) {
        if (cq.c > 0) {
          nextQuotes[sym] = {
            symbol: sym,
            price: cq.c,
            change: cq.d,
            changePercent: cq.dp,
            source: 'coingecko',
            status: 'live',
            fetchedAt: cryptoQuery.dataUpdatedAt || Date.now(),
          };
        }
      }
    }

    cryptoSymbols.forEach(sym => {
      if (!nextQuotes[sym] && (cryptoQuery.isError || cryptoQuery.isFetched)) {
        nextQuotes[sym] = {
          symbol: sym,
          price: 0,
          change: 0,
          changePercent: 0,
          source: 'unavailable',
          status: 'unavailable',
          fetchedAt: cryptoQuery.dataUpdatedAt || Date.now(),
          error: 'Crypto price unavailable',
        };
      }
    });

    return nextQuotes;
  }, [
    cryptoQuery.data,
    cryptoQuery.dataUpdatedAt,
    cryptoQuery.isError,
    cryptoQuery.isFetched,
    cryptoSymbols,
    stockQuery.data,
    stockQuery.dataUpdatedAt,
    stockQuery.error,
    stockQuery.isError,
    stockSymbols,
  ]);

  const isLoading = stockQuery.isLoading || cryptoQuery.isLoading;
  const liveCount = Object.values(quotes).filter(q => q.status === 'live').length;

  return {
    quotes,
    isLoading,
    liveCount,
    totalRequested: symbols.length,
  };
}
