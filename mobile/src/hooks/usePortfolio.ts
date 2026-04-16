import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPortfolios,
  createPortfolio,
  deletePortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from '../services/portfolio';
import { useAuthStore } from '../store/authStore';
import type { Portfolio } from '../types/market';

export function usePortfolios() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient     = useQueryClient();

  const query = useQuery<Portfolio[], Error>({
    queryKey: ['portfolios'],
    queryFn:  fetchPortfolios,
    enabled:  isAuthenticated,
    staleTime: 2 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createPortfolio(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePortfolio(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] }),
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      portfolioId,
      symbol,
      quantity,
      avg_cost,
    }: {
      portfolioId: number;
      symbol:      string;
      quantity:    number;
      avg_cost:    number;
    }) => addPortfolioItem(portfolioId, symbol, quantity, avg_cost),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => deletePortfolioItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] }),
  });

  return {
    portfolios:      query.data ?? [],
    isLoading:       query.isLoading,
    isError:         query.isError,
    refetch:         query.refetch,
    createPortfolio: createMutation.mutateAsync,
    deletePortfolio: deleteMutation.mutateAsync,
    addItem:         addItemMutation.mutateAsync,
    removeItem:      removeItemMutation.mutateAsync,
    isCreating:      createMutation.isPending,
  };
}
