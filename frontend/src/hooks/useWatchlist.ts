import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/services/api';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  symbol: string;
  notes: string | null;
  sort_order: number;
}

export interface Watchlist {
  id: number;
  user_id: number;
  name: string;
  items?: WatchlistItem[];
  items_count?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the user's first (or only) watchlist.
 *
 * Strategy:
 *  1. Fetch all watchlists — if none exist, create a default "My Watchlist".
 *  2. Load the first watchlist's items.
 *  3. Expose addSymbol / removeItem mutations.
 */
export function useWatchlist() {
  const qc = useQueryClient();

  // ── Fetch all watchlists ──────────────────────────────────────────────────
  const listsQuery = useQuery<Watchlist[]>({
    queryKey: ['watchlists'],
    queryFn: () => api.get<Watchlist[]>('/api/watchlists'),
    retry: 1,
  });

  // The first watchlist id (undefined while loading)
  const watchlistId = listsQuery.data?.[0]?.id;

  // ── Fetch items for the first watchlist ──────────────────────────────────
  const itemsQuery = useQuery<Watchlist>({
    queryKey: ['watchlist', watchlistId],
    queryFn: () => api.get<Watchlist>(`/api/watchlists/${watchlistId}`),
    enabled: !!watchlistId,
    retry: 1,
  });

  const items: WatchlistItem[] = itemsQuery.data?.items ?? [];

  // ── Create default watchlist if user has none ─────────────────────────────
  const createDefault = useMutation({
    mutationFn: () =>
      api.post<Watchlist>('/api/watchlists', { name: 'My Watchlist' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  // Auto-create if lists loaded and empty
  const listsLoaded = !listsQuery.isLoading;
  const hasNoLists = listsLoaded && listsQuery.data?.length === 0;

  if (hasNoLists && !createDefault.isPending && !createDefault.isSuccess) {
    createDefault.mutate();
  }

  // ── Add symbol ────────────────────────────────────────────────────────────
  const addSymbol = useMutation({
    mutationFn: (symbol: string) =>
      api.post<WatchlistItem>(`/api/watchlists/${watchlistId}/items`, { symbol }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist', watchlistId] });
    },
  });

  // ── Remove item ───────────────────────────────────────────────────────────
  const removeItem = useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/api/watchlist-items/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist', watchlistId] });
    },
  });

  return {
    items,
    watchlistId,
    isLoading: listsQuery.isLoading || (!!watchlistId && itemsQuery.isLoading),
    addSymbol: (symbol: string) => addSymbol.mutateAsync(symbol),
    removeItem: (itemId: number) => removeItem.mutateAsync(itemId),
    addError: addSymbol.error instanceof ApiError ? addSymbol.error.message : null,
    isAdding: addSymbol.isPending,
    isRemoving: removeItem.isPending,
  };
}
