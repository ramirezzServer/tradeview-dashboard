import { useState, useEffect } from 'react';
import { isFinnhubConfigured } from '@/services/finnhub';

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

async function fetchEarnings(symbol: string): Promise<EarningsEntry[]> {
  const res = await fetch(`${API_BASE}/api/market/earnings/${encodeURIComponent(symbol)}`, {
    headers: { Accept: 'application/json' },
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
  const [state, setState] = useState<EarningsState>({
    data: [], loading: true, isLive: false, error: null,
  });

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, isLive: false, error: 'NOT_CONFIGURED' });
      return;
    }

    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    fetchEarnings(symbol)
      .then(items => {
        if (cancelled) return;
        // Sort newest-first, take last 8 quarters
        const sorted = [...items]
          .sort((a, b) => b.period.localeCompare(a.period))
          .slice(0, 8);
        setState({ data: sorted, loading: false, isLive: sorted.length > 0, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({ data: [], loading: false, isLive: false, error: e instanceof Error ? e.message : String(e) });
      });

    return () => { cancelled = true; };
  }, [symbol]);

  return state;
}
