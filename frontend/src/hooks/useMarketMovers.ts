import { useQuery } from '@tanstack/react-query';
import { isFinnhubConfigured } from '@/services/finnhub';
import { dedupeMarketRequest, getCachedMarketData, setCachedMarketData } from '@/lib/marketCache';
import { queryGc, retryUnlessClientError } from '@/lib/queryOptions';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export interface LiveMover {
  symbol:        string;
  price:         number;
  change:        number;
  changePercent: number;
  volume:        number;
}

export interface MarketMoversData {
  topGainers:     LiveMover[];
  topLosers:      LiveMover[];
  mostActive:     LiveMover[];
  lastUpdated:    string | null;
  fetchedAt:      number;
  source:         'alphavantage' | 'simulated';
  reason?:        string;
}

const FALLBACK_MOVERS: MarketMoversData = {
  topGainers: [
    { symbol: 'NVDA', price: 126.42, change: 4.81, changePercent: 3.96, volume: 58200000 },
    { symbol: 'MSFT', price: 429.18, change: 8.44, changePercent: 2.01, volume: 25100000 },
    { symbol: 'AAPL', price: 212.63, change: 3.12, changePercent: 1.49, volume: 44100000 },
  ],
  topLosers: [
    { symbol: 'TSLA', price: 178.91, change: -5.22, changePercent: -2.84, volume: 77400000 },
    { symbol: 'NFLX', price: 612.24, change: -11.66, changePercent: -1.87, volume: 6100000 },
    { symbol: 'INTC', price: 31.62, change: -0.46, changePercent: -1.43, volume: 38900000 },
  ],
  mostActive: [
    { symbol: 'TSLA', price: 178.91, change: -5.22, changePercent: -2.84, volume: 77400000 },
    { symbol: 'NVDA', price: 126.42, change: 4.81, changePercent: 3.96, volume: 58200000 },
    { symbol: 'AAPL', price: 212.63, change: 3.12, changePercent: 1.49, volume: 44100000 },
  ],
  lastUpdated: null,
  fetchedAt: Date.now(),
  source: 'simulated',
  reason: 'frontend fallback',
};

async function fetchMovers(): Promise<MarketMoversData> {
  const cacheKey = 'market:movers';
  const cached = getCachedMarketData<MarketMoversData>(cacheKey);
  if (cached) return cached;

  return dedupeMarketRequest(cacheKey, async () => {
  const res = await fetch(`${API_BASE}/market/movers`, {
    headers: { Accept: 'application/json' },
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (res.status === 503) throw new Error('AV_NOT_CONFIGURED');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const json = await res.json() as {
    success: boolean;
    message: string;
    data: {
      top_gainers:          LiveMover[];
      top_losers:           LiveMover[];
      most_actively_traded: LiveMover[];
      last_updated:         string | null;
      meta?: {
        provider?: string;
        reason?: string;
      };
    };
  };

  if (!json.success) throw new Error(json.message ?? 'BACKEND_ERROR');

  return {
    topGainers:  json.data.top_gainers          ?? [],
    topLosers:   json.data.top_losers            ?? [],
    mostActive:  json.data.most_actively_traded  ?? [],
    lastUpdated: json.data.last_updated          ?? null,
    fetchedAt:   Date.now(),
    source:      json.data.meta?.provider === 'simulated' ? 'simulated' : 'alphavantage',
    reason:      json.data.meta?.reason,
  };
  }).then(data => setCachedMarketData(cacheKey, data, 5 * 60_000)).catch(() => ({
    ...FALLBACK_MOVERS,
    fetchedAt: Date.now(),
  }));
}

/**
 * Fetches live top gainers, losers, and most-active tickers from Alpha Vantage
 * via the Laravel backend proxy. Cached backend-side for 15 min; refetches every
 * 5 min client-side (within the backend cache window).
 */
export function useMarketMovers() {
  const configured = isFinnhubConfigured(); // reuses API_BASE check

  const query = useQuery({
    queryKey: ['market-movers'],
    queryFn:  fetchMovers,
    enabled:  configured,
    staleTime:       5 * 60_000,  // 5 min — matches backend cache
    gcTime:          queryGc.userData,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    retry: retryUnlessClientError,
    placeholderData: previous => previous,
  });

  return {
    data:      query.data ?? null,
    isLoading: query.isLoading,
    isLive:    !!query.data && !query.isError,
    error:     query.error instanceof Error ? query.error.message : null,
    fetchedAt: query.data?.fetchedAt ?? null,
  };
}
