import { useState, useEffect } from 'react';
import { getCandles, getAlternativeCandles, isFinnhubConfigured } from '@/services/finnhub';
import {
  fetchCandlesWithFallback,
  getRange,
  type CandleProvider,
  type Timeframe,
} from '@/lib/candleFallback';
import type { OHLCVData } from '@/types/stock';

export type { Timeframe };

interface CandleState {
  data:     OHLCVData[];
  loading:  boolean;
  error:    string | null;
  isLive:   boolean;
  provider: CandleProvider | null;
}

const defaultDeps = { getCandles, getAlternativeCandles };

export function useFinnhubCandles(symbol: string, timeframe: Timeframe): CandleState {
  const [state, setState] = useState<CandleState>({
    data: [], loading: true, error: null, isLive: false, provider: null,
  });

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false, provider: null });
      return;
    }

    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    const { from, to, resolution } = getRange(timeframe);

    fetchCandlesWithFallback(symbol, resolution, from, to, defaultDeps)
      .then(({ data, provider }) => {
        if (cancelled) return;
        setState({ data, loading: false, error: null, isLive: true, provider });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        // Map AV rate-limit to a distinct error code so the UI can show a specific message.
        const error = msg === 'RATE_LIMITED' ? 'AV_RATE_LIMITED' : msg;
        setState({ data: [], loading: false, error, isLive: false, provider: null });
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return state;
}
