import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/services/api';
import { shouldAutoCreate } from '@/lib/defaultResource';
import type { Portfolio, PortfolioItem, AddHoldingInput } from '@shared/schemas/portfolio';
import { queryFreshness, queryGc, retryUnlessClientError } from '@/lib/queryOptions';

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
  const optimisticId = useRef(-1);

  // ── Fetch all portfolios ──────────────────────────────────────────────────
  const listsQuery = useQuery<Portfolio[]>({
    queryKey: ['portfolios'],
    queryFn: () => api.get<Portfolio[]>('/portfolios'),
    retry: retryUnlessClientError,
    staleTime: queryFreshness.userData,
    gcTime: queryGc.userData,
    placeholderData: previous => previous,
  });

  const portfolioId = listsQuery.data?.[0]?.id;

  // ── Fetch items ───────────────────────────────────────────────────────────
  const itemsQuery = useQuery<Portfolio>({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => api.get<Portfolio>(`/portfolios/${portfolioId}`),
    enabled: !!portfolioId,
    retry: retryUnlessClientError,
    staleTime: queryFreshness.userData,
    gcTime: queryGc.userData,
    placeholderData: previous => previous,
  });

  const items: PortfolioItem[] = itemsQuery.data?.items ?? [];

  // ── Auto-create default portfolio ─────────────────────────────────────────
  const createDefault = useMutation({
    mutationFn: () =>
      api.post<Portfolio>('/portfolios', { name: 'My Portfolio' }),
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
    mutationFn: (input: AddHoldingInput) => {
      if (!portfolioId) {
        throw new ApiError(0, 'Portfolio is still being created. Please try again.');
      }
      return api.post<PortfolioItem>(`/portfolios/${portfolioId}/items`, input);
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['portfolio', portfolioId] });
      const previous = qc.getQueryData<Portfolio>(['portfolio', portfolioId]);
      const optimisticItem: PortfolioItem = {
        id: optimisticId.current--,
        portfolio_id: portfolioId!,
        symbol: input.symbol.toUpperCase().trim(),
        quantity: input.quantity,
        average_cost: input.average_cost,
        currency: input.currency ?? 'USD',
        purchased_at: input.purchased_at ?? null,
        notes: input.notes ?? null,
      };
      qc.setQueryData<Portfolio>(['portfolio', portfolioId], current => ({
        ...(current ?? previous ?? { id: portfolioId!, user_id: 0, name: 'My Portfolio' }),
        items: [...(current?.items ?? previous?.items ?? []), optimisticItem],
      }));
      return { previous, optimisticId: optimisticItem.id };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(['portfolio', portfolioId], context.previous);
      }
    },
    onSuccess: (created, _input, context) => {
      qc.setQueryData<Portfolio>(['portfolio', portfolioId], current => ({
        ...(current ?? context?.previous ?? { id: portfolioId!, user_id: 0, name: 'My Portfolio' }),
        items: (current?.items ?? []).map(item => item.id === context?.optimisticId ? created : item),
      }));
    },
  });

  // ── Remove holding ────────────────────────────────────────────────────────
  const removeHolding = useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/portfolio-items/${itemId}`),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ['portfolio', portfolioId] });
      const previous = qc.getQueryData<Portfolio>(['portfolio', portfolioId]);
      qc.setQueryData<Portfolio>(['portfolio', portfolioId], current => ({
        ...(current ?? previous ?? { id: portfolioId!, user_id: 0, name: 'My Portfolio' }),
        items: (current?.items ?? previous?.items ?? []).filter(item => item.id !== itemId),
      }));
      return { previous };
    },
    onError: (_error, _itemId, context) => {
      if (context?.previous) {
        qc.setQueryData(['portfolio', portfolioId], context.previous);
      }
    },
  });

  // ── Update holding ────────────────────────────────────────────────────────
  const updateHolding = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Partial<AddHoldingInput> }) =>
      api.put<PortfolioItem>(`/portfolio-items/${itemId}`, data),
    onMutate: async ({ itemId, data }) => {
      await qc.cancelQueries({ queryKey: ['portfolio', portfolioId] });
      const previous = qc.getQueryData<Portfolio>(['portfolio', portfolioId]);
      qc.setQueryData<Portfolio>(['portfolio', portfolioId], current => ({
        ...(current ?? previous ?? { id: portfolioId!, user_id: 0, name: 'My Portfolio' }),
        items: (current?.items ?? previous?.items ?? []).map(item =>
          item.id === itemId ? { ...item, ...data } : item
        ),
      }));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(['portfolio', portfolioId], context.previous);
      }
    },
    onSuccess: (updated) => {
      qc.setQueryData<Portfolio>(['portfolio', portfolioId], current => ({
        ...(current ?? { id: portfolioId!, user_id: 0, name: 'My Portfolio' }),
        items: (current?.items ?? []).map(item => item.id === updated.id ? updated : item),
      }));
    },
  });

  return {
    items,
    portfolioId,
    isLoading: listsQuery.isLoading || isCreating || (!!portfolioId && itemsQuery.isLoading),
    addHolding: (input: AddHoldingInput) => addHolding.mutateAsync(input),
    removeHolding: (itemId: number) => removeHolding.mutateAsync(itemId),
    updateHolding: (itemId: number, data: Partial<AddHoldingInput>) =>
      updateHolding.mutateAsync({ itemId, data }),
    addError: addHolding.error instanceof ApiError ? addHolding.error.message : null,
    isAdding: addHolding.isPending || isCreating,
    isRemoving: removeHolding.isPending,
    isUpdating: updateHolding.isPending,
  };
}
