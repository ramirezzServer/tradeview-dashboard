import { useState, useEffect } from 'react';
import { getCandles, getAlternativeCandles, FinnhubCandle, isFinnhubConfigured } from '@/services/finnhub';
import { OHLCVData } from '@/types/stock';

interface CandleState {
  data:     OHLCVData[];
  loading:  boolean;
  error:    string | null;
  isLive:   boolean;
  provider: 'finnhub' | 'alphavantage' | null;
}

function mapCandles(raw: FinnhubCandle): OHLCVData[] {
  if (raw.s !== 'ok' || !raw.t?.length) return [];
  return raw.t.map((t, i) => ({
    date:   new Date(t * 1000).toISOString().split('T')[0],
    open:   raw.o[i],
    high:   raw.h[i],
    low:    raw.l[i],
    close:  raw.c[i],
    volume: raw.v[i],
  }));
}

type Timeframe = '1W' | '1M' | '3M';

function getRange(tf: Timeframe): { from: number; to: number; resolution: string } {
  const to  = Math.floor(Date.now() / 1000);
  const day = 86400;
  switch (tf) {
    case '1W': return { from: to - 7  * day, to, resolution: '60' };
    case '1M': return { from: to - 30 * day, to, resolution: 'D'  };
    case '3M': return { from: to - 90 * day, to, resolution: 'D'  };
  }
}

/**
 * Fetches OHLCV candle data for a symbol with automatic provider fallback:
 *
 *   1. Primary:   Finnhub  /api/market/candles/{symbol}
 *   2. Fallback:  Alpha Vantage /api/market/candles-alt/{symbol}
 *      → triggered automatically on PLAN_RESTRICTION (Finnhub 403)
 *      → requires ALPHA_VANTAGE_KEY set in backend .env
 *
 * The `provider` field in the returned state identifies which source succeeded.
 * If both fail, `error` is set and `data` is empty.
 */
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

    const tryAlternative = async () => {
      try {
        const raw    = await getAlternativeCandles(symbol, from, to);
        const mapped = mapCandles(raw);
        if (cancelled) return;
        if (mapped.length === 0) {
          setState({ data: [], loading: false, error: 'NO_DATA', isLive: false, provider: null });
        } else {
          setState({ data: mapped, loading: false, error: null, isLive: true, provider: 'alphavantage' });
        }
      } catch (altE: unknown) {
        if (cancelled) return;
        const altMsg = altE instanceof Error ? altE.message : String(altE);
        // RATE_LIMITED = AV free quota exhausted; HTTP_503 = AV not configured
        setState({
          data:     [],
          loading:  false,
          error:    altMsg === 'RATE_LIMITED' ? 'AV_RATE_LIMITED' : 'PLAN_RESTRICTION',
          isLive:   false,
          provider: null,
        });
      }
    };

    getCandles(symbol, resolution, from, to)
      .then(raw => {
        if (cancelled) return;
        const mapped = mapCandles(raw);
        if (mapped.length === 0) {
          setState({ data: [], loading: false, error: 'NO_DATA', isLive: false, provider: null });
        } else {
          setState({ data: mapped, loading: false, error: null, isLive: true, provider: 'finnhub' });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        // 403 from Finnhub → plan restriction → try Alpha Vantage
        if (msg === 'PLAN_RESTRICTION' || msg === 'ACCESS_FORBIDDEN') {
          tryAlternative();
        } else {
          setState({ data: [], loading: false, error: msg, isLive: false, provider: null });
        }
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return state;
}
