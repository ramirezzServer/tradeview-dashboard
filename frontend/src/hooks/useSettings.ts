import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { UserSettings, PartialSettings } from '@shared/schemas/settings';

export type { UserSettings, PartialSettings };

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
