import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// ─── Backend settings shape ───────────────────────────────────────────────────

export interface UserSettings {
  id?: number;
  user_id?: number;
  theme: 'dark' | 'light';
  currency: string;
  default_resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
  default_symbol: string;
  preferred_news_category: 'general' | 'forex' | 'crypto' | 'merger';
  dashboard_layout?: Record<string, unknown> | null;
}

export type PartialSettings = Partial<Omit<UserSettings, 'id' | 'user_id'>>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Reads and writes the user's settings from the Laravel backend.
 * The backend auto-creates defaults on first GET, so data is always present.
 */
export function useSettings() {
  const qc = useQueryClient();

  const query = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get<UserSettings>('/api/settings'),
    retry: 1,
    staleTime: 60_000, // settings don't change often — cache for 1 min
  });

  const mutation = useMutation({
    mutationFn: (updates: PartialSettings) =>
      api.put<UserSettings>('/api/settings', updates),
    onSuccess: (updated) => {
      // Update cached settings immediately
      qc.setQueryData(['settings'], updated);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: (updates: PartialSettings) => mutation.mutateAsync(updates),
    isSaving: mutation.isPending,
  };
}
