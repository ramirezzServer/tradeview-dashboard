import { useState, useEffect } from 'react';
import { getCompanyProfile, getBasicFinancials, FinnhubProfile, isFinnhubConfigured } from '@/services/finnhub';

export interface ProfileData {
  profile: FinnhubProfile | null;
  metrics: Record<string, number | null>;
}

interface ProfileState {
  data: ProfileData;
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useFinnhubProfile(symbol: string): ProfileState {
  const [state, setState] = useState<ProfileState>({
    data: { profile: null, metrics: {} },
    loading: true,
    error: null,
    isLive: false,
  });

  useEffect(() => {
    if (!isFinnhubConfigured()) {
      setState({ data: { profile: null, metrics: {} }, loading: false, error: 'FINNHUB_KEY_MISSING', isLive: false });
      return;
    }

    let cancelled = false;

    Promise.all([getCompanyProfile(symbol), getBasicFinancials(symbol)])
      .then(([profile, financials]) => {
        if (cancelled) return;
        setState({
          data: { profile, metrics: financials.metric || {} },
          loading: false,
          error: null,
          isLive: true,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e), isLive: false }));
      });

    return () => { cancelled = true; };
  }, [symbol]);

  return state;
}
