import { useCallback, useState, useEffect, useRef } from 'react';
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
  refreshing: boolean;
  refetch:  () => void;
}

const defaultDeps = { getCandles, getAlternativeCandles };

export function useFinnhubCandles(
  symbol: string,
  timeframe: Timeframe,
  resolutionOverride?: string
): CandleState {
  const [state, setState] = useState<CandleState>({
    data: [], loading: true, error: null, isLive: false, provider: null, refreshing: false, refetch: () => {},
  });
  const [requestKey, setRequestKey] = useState(0);
  const refetch = useCallback(() => setRequestKey(key => key + 1), []);
  const requestSeq = useRef(0);

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false, provider: null, refreshing: false, refetch });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const requestId = requestSeq.current + 1;
    requestSeq.current = requestId;

    setState(s => ({ ...s, loading: s.data.length === 0, refreshing: s.data.length > 0, error: null }));

    const { from, to, resolution } = getRange(timeframe);
    const selectedResolution = resolutionOverride ?? resolution;

    const normalizedSymbol = symbol.toUpperCase();
    const candlePromise = isCryptoSymbol(normalizedSymbol)
      ? getCryptoCandles(normalizedSymbol, selectedResolution, from, to, { signal: controller.signal })
          .then(raw => {
            const data = mapCandles(raw);
            if (data.length === 0) throw new Error('EMPTY_CANDLES');
            return { data, provider: 'coingecko' as const };
          })
      : fetchCandlesWithFallback(
          normalizedSymbol,
          selectedResolution,
          from,
          to,
          defaultDeps,
          { signal: controller.signal },
        );

    candlePromise
      .then(({ data, provider }) => {
        if (cancelled || requestSeq.current !== requestId) return;
        setState({ data, loading: false, error: null, isLive: true, provider, refreshing: false, refetch });
      })
      .catch((e: unknown) => {
        if (cancelled || controller.signal.aborted || requestSeq.current !== requestId) return;
        const msg = e instanceof Error ? e.message : String(e);
        // Map AV rate-limit to a distinct error code so the UI can show a specific message.
        const error = msg === 'RATE_LIMITED' ? 'AV_RATE_LIMITED' : msg;
        setState(s => s.data.length > 0
          ? { ...s, loading: false, refreshing: false, error, refetch }
          : { data: [], loading: false, error, isLive: false, provider: null, refreshing: false, refetch }
        );
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [symbol, timeframe, resolutionOverride, requestKey, refetch]);

  return state;
}
