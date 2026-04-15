import { useQuery } from '@tanstack/react-query';
import { isFinnhubConfigured } from '@/services/finnhub';

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
}

async function fetchMovers(): Promise<MarketMoversData> {
  const res = await fetch(`${API_BASE}/api/market/movers`, {
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
    };
  };

  if (!json.success) throw new Error(json.message ?? 'BACKEND_ERROR');

  return {
    topGainers:  json.data.top_gainers          ?? [],
    topLosers:   json.data.top_losers            ?? [],
    mostActive:  json.data.most_actively_traded  ?? [],
    lastUpdated: json.data.last_updated          ?? null,
    fetchedAt:   Date.now(),
  };
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
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return {
    data:      query.data ?? null,
    isLoading: query.isLoading,
    isLive:    !!query.data && !query.isError,
    error:     query.error instanceof Error ? query.error.message : null,
    fetchedAt: query.data?.fetchedAt ?? null,
  };
}
