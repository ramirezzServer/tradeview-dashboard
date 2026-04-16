import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchWatchlists,
  createWatchlist,
  deleteWatchlist,
  addWatchlistItem,
  deleteWatchlistItem,
} from '../services/watchlist';
import { useAuthStore } from '../store/authStore';
import type { Watchlist } from '../types/market';

export function useWatchlists() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient     = useQueryClient();

  const query = useQuery<Watchlist[], Error>({
    queryKey: ['watchlists'],
    queryFn:  fetchWatchlists,
    enabled:  isAuthenticated,
    staleTime: 2 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createWatchlist(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWatchlist(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
  });

  const addItemMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) =>
      addWatchlistItem(watchlistId, symbol),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => deleteWatchlistItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
  });

  return {
    watchlists:    query.data ?? [],
    isLoading:     query.isLoading,
    isError:       query.isError,
    refetch:       query.refetch,
    createWatchlist: createMutation.mutateAsync,
    deleteWatchlist: deleteMutation.mutateAsync,
    addItem:         addItemMutation.mutateAsync,
    removeItem:      removeItemMutation.mutateAsync,
    isCreating:    createMutation.isPending,
    isDeleting:    deleteMutation.isPending,
  };
}
