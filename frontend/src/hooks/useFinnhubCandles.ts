import { useCallback, useState, useEffect } from 'react';
import { getCandles, getAlternativeCandles, getCryptoCandles, isFinnhubConfigured } from '@/services/finnhub';
import { isCryptoSymbol } from '@/services/coingecko';
import {
  fetchCandlesWithFallback,
  getRange,
  mapCandles,
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
  refetch:  () => void;
}

const defaultDeps = { getCandles, getAlternativeCandles };

export function useFinnhubCandles(
  symbol: string,
  timeframe: Timeframe,
  resolutionOverride?: string
): CandleState {
  const [state, setState] = useState<CandleState>({
    data: [], loading: true, error: null, isLive: false, provider: null, refetch: () => {},
  });
  const [requestKey, setRequestKey] = useState(0);
  const refetch = useCallback(() => setRequestKey(key => key + 1), []);

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false, provider: null, refetch });
      return;
    }

    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    const { from, to, resolution } = getRange(timeframe);
    const selectedResolution = resolutionOverride ?? resolution;

    const normalizedSymbol = symbol.toUpperCase();
    const candlePromise = isCryptoSymbol(normalizedSymbol)
      ? getCryptoCandles(normalizedSymbol, selectedResolution, from, to)
          .then(raw => {
            const data = mapCandles(raw);
            if (data.length === 0) throw new Error('NO_DATA');
            return { data, provider: 'coingecko' as const };
          })
      : fetchCandlesWithFallback(normalizedSymbol, selectedResolution, from, to, defaultDeps);

    candlePromise
      .then(({ data, provider }) => {
        if (cancelled) return;
        setState({ data, loading: false, error: null, isLive: true, provider, refetch });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        // Map AV rate-limit to a distinct error code so the UI can show a specific message.
        const error = msg === 'RATE_LIMITED' ? 'AV_RATE_LIMITED' : msg;
        setState({ data: [], loading: false, error, isLive: false, provider: null, refetch });
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe, resolutionOverride, requestKey, refetch]);

  return state;
}
