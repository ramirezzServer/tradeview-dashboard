import { useQuery } from '@tanstack/react-query';
import { isFinnhubConfigured } from '@/services/finnhub';
import { queryFreshness, queryGc, retryUnlessClientError } from '@/lib/queryOptions';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export interface EarningsEntry {
  period:          string;  // "YYYY-MM-DD"
  quarter:         number;
  year:            number;
  actual:          number | null;
  estimate:        number | null;
  surprise:        number | null;
  surprisePercent: number | null;
}

interface EarningsState {
  data:    EarningsEntry[];
  loading: boolean;
  isLive:  boolean;
  error:   string | null;
}

async function fetchEarnings(symbol: string, signal?: AbortSignal): Promise<EarningsEntry[]> {
  const res = await fetch(`${API_BASE}/market/earnings/${encodeURIComponent(symbol)}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const json = await res.json() as { success: boolean; data: EarningsEntry[] };
  if (!json.success) throw new Error('BACKEND_ERROR');
  return json.data ?? [];
}

/**
 * Fetches quarterly earnings history (EPS actual vs estimate) from Finnhub.
 * Available on the Finnhub free plan.
 */
export function useFinnhubEarnings(symbol: string): EarningsState {
  const configured = isFinnhubConfigured();
  const normalizedSymbol = symbol.toUpperCase().trim();

  const query = useQuery<EarningsEntry[], Error>({
    queryKey: ['earnings', normalizedSymbol],
    queryFn: async ({ signal }) => {
      const items = await fetchEarnings(normalizedSymbol, signal);

      return [...items]
        .sort((a, b) => b.period.localeCompare(a.period))
        .slice(0, 8);
    },
    enabled: configured && Boolean(normalizedSymbol),
    staleTime: queryFreshness.fundamentals,
    gcTime: queryGc.long,
    retry: retryUnlessClientError,
    placeholderData: previous => previous,
  });

  if (!configured) {
    return { data: [], loading: false, isLive: false, error: 'NOT_CONFIGURED' };
  }

  const data = query.data ?? [];

  return {
    data,
    loading: query.isLoading,
    isLive: data.length > 0 && !query.isError,
    error: query.error?.message ?? null,
  };
}
