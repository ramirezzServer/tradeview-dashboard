import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { SavedNewsItem } from '@shared/schemas/saved-news';

export type { SavedNewsItem };

export interface SaveArticlePayload {
  article_url: string;
  headline: string;
  source?: string;
  summary?: string;
  category?: string;
  article_datetime?: number;
  notes?: string;
}

export function useSavedNews() {
  const qc = useQueryClient();

  const query = useQuery<SavedNewsItem[]>({
    queryKey: ['saved-news'],
    queryFn: () => api.get<SavedNewsItem[]>('/news/saved'),
    retry: 1,
  });

  const savedNews = query.data ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload: SaveArticlePayload) =>
      api.post<SavedNewsItem>('/news/saved', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-news'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string | null }) =>
      api.put<SavedNewsItem>(`/news/saved/${id}`, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-news'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/news/saved/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-news'] });
    },
  });

  return {
    savedNews,
    isLoading: query.isLoading,
    isSaved: (url: string) => savedNews.some(n => n.article_url === url),
    saveArticle: (payload: SaveArticlePayload) => saveMutation.mutateAsync(payload),
    updateNotes: (id: number, notes: string | null) => updateMutation.mutateAsync({ id, notes }),
    removeArticle: (id: number) => removeMutation.mutateAsync(id),
    isSaving: saveMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
