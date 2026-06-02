import { useQuery } from '@tanstack/react-query';
import { getCompanyProfile, getBasicFinancials, FinnhubProfile, isFinnhubConfigured } from '@/services/finnhub';
import { queryFreshness, queryGc, retryUnlessClientError } from '@/lib/queryOptions';

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
  const normalizedSymbol = symbol.toUpperCase();
  const configured = isFinnhubConfigured();

  const query = useQuery<ProfileData, Error>({
    queryKey: ['profile', normalizedSymbol],
    queryFn: async () => {
      const [profile, financials] = await Promise.all([
        getCompanyProfile(normalizedSymbol),
        getBasicFinancials(normalizedSymbol),
      ]);

      return { profile, metrics: financials.metric || {} };
    },
    enabled: configured && Boolean(normalizedSymbol),
    staleTime: queryFreshness.fundamentals,
    gcTime: queryGc.long,
    retry: retryUnlessClientError,
    placeholderData: previous => previous,
  });

  if (!configured) {
    return {
      data: { profile: null, metrics: {} },
      loading: false,
      error: 'FINNHUB_KEY_MISSING',
      isLive: false,
    };
  }

  return {
    data: query.data ?? { profile: null, metrics: {} },
    loading: query.isLoading,
    error: query.error?.message ?? null,
    isLive: Boolean(query.data?.profile) && !query.isError,
  };
}
