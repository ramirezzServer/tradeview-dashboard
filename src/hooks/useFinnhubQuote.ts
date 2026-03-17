import { useState, useEffect, useRef } from 'react';
import { getQuote, FinnhubQuote, isFinnhubConfigured } from '@/services/finnhub';

interface QuoteState {
  data: FinnhubQuote | null;
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useFinnhubQuote(symbol: string, refreshMs = 15000): QuoteState {
  const [state, setState] = useState<QuoteState>({ data: null, loading: true, error: null, isLive: false });
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: null, loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false });
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        const data = await getQuote(symbol);
        if (!cancelled) {
          // c === 0 means no data for that symbol (e.g. crypto tickers)
          if (data.c === 0) {
            setState(s => ({ ...s, loading: false, error: 'NO_DATA', isLive: false }));
          } else {
            setState({ data, loading: false, error: null, isLive: true });
          }
        }
      } catch (e: any) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: e.message, isLive: false }));
      }
    };

    fetch();
    timer.current = setInterval(fetch, refreshMs);
    return () => { cancelled = true; clearInterval(timer.current); };
  }, [symbol, refreshMs]);

  return state;
}
