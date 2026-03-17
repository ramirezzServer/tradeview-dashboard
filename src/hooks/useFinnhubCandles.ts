import { useState, useEffect } from 'react';
import { getCandles, FinnhubCandle, isFinnhubConfigured } from '@/services/finnhub';
import { OHLCVData } from '@/types/stock';

interface CandleState {
  data: OHLCVData[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

function mapCandles(raw: FinnhubCandle): OHLCVData[] {
  if (raw.s !== 'ok' || !raw.t?.length) return [];
  return raw.t.map((t, i) => ({
    date: new Date(t * 1000).toISOString().split('T')[0],
    open: raw.o[i],
    high: raw.h[i],
    low: raw.l[i],
    close: raw.c[i],
    volume: raw.v[i],
  }));
}

type Timeframe = '1W' | '1M' | '3M';

function getRange(tf: Timeframe): { from: number; to: number; resolution: string } {
  const to = Math.floor(Date.now() / 1000);
  const day = 86400;
  switch (tf) {
    case '1W': return { from: to - 7 * day, to, resolution: '60' };
    case '1M': return { from: to - 30 * day, to, resolution: 'D' };
    case '3M': return { from: to - 90 * day, to, resolution: 'D' };
  }
}

export function useFinnhubCandles(symbol: string, timeframe: Timeframe): CandleState {
  const [state, setState] = useState<CandleState>({ data: [], loading: true, error: null, isLive: false });

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false });
      return;
    }

    let cancelled = false;
    setState(s => ({ ...s, loading: true }));

    const { from, to, resolution } = getRange(timeframe);

    getCandles(symbol, resolution, from, to)
      .then(raw => {
        if (cancelled) return;
        const mapped = mapCandles(raw);
        if (mapped.length === 0) {
          setState({ data: [], loading: false, error: 'NO_DATA', isLive: false });
        } else {
          setState({ data: mapped, loading: false, error: null, isLive: true });
        }
      })
      .catch((e: any) => {
        if (!cancelled) setState({ data: [], loading: false, error: e.message, isLive: false });
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return state;
}
