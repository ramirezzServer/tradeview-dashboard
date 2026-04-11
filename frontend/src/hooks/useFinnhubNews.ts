import { useState, useEffect } from 'react';
import { getMarketNews, FinnhubNewsItem, isFinnhubConfigured } from '@/services/finnhub';

interface NewsState {
  data: FinnhubNewsItem[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useFinnhubNews(): NewsState {
  const [state, setState] = useState<NewsState>({ data: [], loading: true, error: null, isLive: false });

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: [], loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false });
      return;
    }

    let cancelled = false;

    getMarketNews('general')
      .then(items => {
        if (cancelled) return;
        if (!items?.length) {
          setState({ data: [], loading: false, error: 'NO_DATA', isLive: false });
        } else {
          setState({ data: items.slice(0, 20), loading: false, error: null, isLive: true });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ data: [], loading: false, error: e instanceof Error ? e.message : String(e), isLive: false });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
