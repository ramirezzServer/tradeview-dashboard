import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/services/api';
import { shouldAutoCreate } from '@/lib/defaultResource';
import type { Watchlist, WatchlistItem } from '@shared/schemas/watchlist';

export type { Watchlist, WatchlistItem };

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
  const optimisticId = useRef(-1);
  const pendingSymbols = useRef(new Set<string>());

  // ── Fetch all watchlists ──────────────────────────────────────────────────
  const listsQuery = useQuery<Watchlist[]>({
    queryKey: ['watchlists'],
    queryFn: () => api.get<Watchlist[]>('/watchlists'),
    retry: 1,
  });

  // The first watchlist id (undefined while loading)
  const watchlistId = listsQuery.data?.[0]?.id;

  // ── Fetch items for the first watchlist ──────────────────────────────────
  const itemsQuery = useQuery<Watchlist>({
    queryKey: ['watchlist', watchlistId],
    queryFn: () => api.get<Watchlist>(`/watchlists/${watchlistId}`),
    enabled: !!watchlistId,
    retry: 1,
  });

  const items: WatchlistItem[] = itemsQuery.data?.items ?? [];

  // ── Create default watchlist if user has none ─────────────────────────────
  const createDefault = useMutation({
    mutationFn: () =>
      api.post<Watchlist>('/watchlists', { name: 'My Watchlist' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  // Auto-create if lists loaded and empty — must be in useEffect, never during render
  const { mutate: createDefaultMutate, isPending: isCreating, isSuccess: wasCreated } = createDefault;
  useEffect(() => {
    if (shouldAutoCreate(listsQuery.isLoading, listsQuery.data, isCreating, wasCreated)) {
      createDefaultMutate();
    }
  }, [listsQuery.isLoading, listsQuery.data, isCreating, wasCreated, createDefaultMutate]);

  // ── Add symbol ────────────────────────────────────────────────────────────
  const addSymbol = useMutation({
    mutationFn: (symbol: string) => {
      if (!watchlistId) {
        throw new ApiError(0, 'Watchlist is still being created. Please try again.');
      }
      const normalized = symbol.toUpperCase().trim();
      if (items.some(item => item.symbol === normalized)) {
        throw new ApiError(409, `'${normalized}' is already in this watchlist.`);
      }
      return api.post<WatchlistItem>(`/watchlists/${watchlistId}/items`, { symbol: normalized });
    },
    onMutate: async (symbol) => {
      const normalized = symbol.toUpperCase().trim();
      if (items.some(item => item.symbol === normalized) || pendingSymbols.current.has(normalized)) {
        throw new ApiError(409, `'${normalized}' is already in this watchlist.`);
      }
      pendingSymbols.current.add(normalized);
      await qc.cancelQueries({ queryKey: ['watchlist', watchlistId] });
      const previous = qc.getQueryData<Watchlist>(['watchlist', watchlistId]);
      const optimisticItem: WatchlistItem = {
        id: optimisticId.current--,
        watchlist_id: watchlistId!,
        symbol: normalized,
        notes: null,
        sort_order: previous?.items?.length ?? 0,
      };
      qc.setQueryData<Watchlist>(['watchlist', watchlistId], current => ({
        ...(current ?? previous ?? { id: watchlistId!, user_id: 0, name: 'My Watchlist' }),
        items: [...(current?.items ?? previous?.items ?? []), optimisticItem],
      }));
      return { previous, symbol: normalized, optimisticId: optimisticItem.id };
    },
    onError: (_error, _symbol, context) => {
      if (context?.previous) {
        qc.setQueryData(['watchlist', watchlistId], context.previous);
      }
    },
    onSuccess: (created, _symbol, context) => {
      qc.setQueryData<Watchlist>(['watchlist', watchlistId], current => ({
        ...(current ?? context?.previous ?? { id: watchlistId!, user_id: 0, name: 'My Watchlist' }),
        items: (current?.items ?? []).map(item => item.id === context?.optimisticId ? created : item),
      }));
    },
    onSettled: (_data, _error, _symbol, context) => {
      if (context?.symbol) pendingSymbols.current.delete(context.symbol);
    },
  });

  // ── Remove item ───────────────────────────────────────────────────────────
  const removeItem = useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/watchlist-items/${itemId}`),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ['watchlist', watchlistId] });
      const previous = qc.getQueryData<Watchlist>(['watchlist', watchlistId]);
      qc.setQueryData<Watchlist>(['watchlist', watchlistId], current => ({
        ...(current ?? previous ?? { id: watchlistId!, user_id: 0, name: 'My Watchlist' }),
        items: (current?.items ?? previous?.items ?? []).filter(item => item.id !== itemId),
      }));
      return { previous };
    },
    onError: (_error, _itemId, context) => {
      if (context?.previous) {
        qc.setQueryData(['watchlist', watchlistId], context.previous);
      }
    },
  });

  return {
    items,
    watchlistId,
    isLoading: listsQuery.isLoading || isCreating || (!!watchlistId && itemsQuery.isLoading),
    addSymbol: (symbol: string) => {
      const normalized = symbol.toUpperCase().trim();
      if (items.some(item => item.symbol === normalized) || pendingSymbols.current.has(normalized)) {
        return Promise.reject(new ApiError(409, `'${normalized}' is already in this watchlist.`));
      }
      return addSymbol.mutateAsync(normalized);
    },
    removeItem: (itemId: number) => removeItem.mutateAsync(itemId),
    addError: addSymbol.error instanceof ApiError ? addSymbol.error.message : null,
    isAdding: addSymbol.isPending || isCreating,
    isRemoving: removeItem.isPending,
  };
}
