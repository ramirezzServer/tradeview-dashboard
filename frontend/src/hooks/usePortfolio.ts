import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/services/api';
import { shouldAutoCreate } from '@/lib/defaultResource';
import type { Portfolio, PortfolioItem, AddHoldingInput } from '@shared/schemas/portfolio';

export type { Portfolio, PortfolioItem, AddHoldingInput };

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the user's first (or only) portfolio.
 *
 * Strategy mirrors useWatchlist:
 *  1. Fetch all portfolios — auto-create "My Portfolio" if empty.
 *  2. Load items for the first portfolio.
 *  3. Expose addHolding / removeHolding / updateHolding mutations.
 */
export function usePortfolio() {
  const qc = useQueryClient();

  // ── Fetch all portfolios ──────────────────────────────────────────────────
  const listsQuery = useQuery<Portfolio[]>({
    queryKey: ['portfolios'],
    queryFn: () => api.get<Portfolio[]>('/api/portfolios'),
    retry: 1,
  });

  const portfolioId = listsQuery.data?.[0]?.id;

  // ── Fetch items ───────────────────────────────────────────────────────────
  const itemsQuery = useQuery<Portfolio>({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => api.get<Portfolio>(`/api/portfolios/${portfolioId}`),
    enabled: !!portfolioId,
    retry: 1,
  });

  const items: PortfolioItem[] = itemsQuery.data?.items ?? [];

  // ── Auto-create default portfolio ─────────────────────────────────────────
  const createDefault = useMutation({
    mutationFn: () =>
      api.post<Portfolio>('/api/portfolios', { name: 'My Portfolio' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });

  // Auto-create if lists loaded and empty — must be in useEffect, never during render
  const { mutate: createDefaultMutate, isPending: isCreating, isSuccess: wasCreated } = createDefault;
  useEffect(() => {
    if (shouldAutoCreate(listsQuery.isLoading, listsQuery.data, isCreating, wasCreated)) {
      createDefaultMutate();
    }
  }, [listsQuery.isLoading, listsQuery.data, isCreating, wasCreated, createDefaultMutate]);

  // ── Add holding ───────────────────────────────────────────────────────────
  const addHolding = useMutation({
    mutationFn: (input: AddHoldingInput) =>
      api.post<PortfolioItem>(`/api/portfolios/${portfolioId}/items`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
    },
  });

  // ── Remove holding ────────────────────────────────────────────────────────
  const removeHolding = useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/api/portfolio-items/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
    },
  });

  // ── Update holding ────────────────────────────────────────────────────────
  const updateHolding = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Partial<AddHoldingInput> }) =>
      api.put<PortfolioItem>(`/api/portfolio-items/${itemId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
    },
  });

  return {
    items,
    portfolioId,
    isLoading: listsQuery.isLoading || (!!portfolioId && itemsQuery.isLoading),
    addHolding: (input: AddHoldingInput) => addHolding.mutateAsync(input),
    removeHolding: (itemId: number) => removeHolding.mutateAsync(itemId),
    updateHolding: (itemId: number, data: Partial<AddHoldingInput>) =>
      updateHolding.mutateAsync({ itemId, data }),
    addError: addHolding.error instanceof ApiError ? addHolding.error.message : null,
    isAdding: addHolding.isPending,
    isRemoving: removeHolding.isPending,
  };
}
