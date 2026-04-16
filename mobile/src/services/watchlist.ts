import { get, post, put, del } from './api';
import type { Watchlist, WatchlistItem } from '../types/market';

export async function fetchWatchlists(): Promise<Watchlist[]> {
  return get<Watchlist[]>('/watchlists');
}

export async function fetchWatchlist(id: number): Promise<Watchlist> {
  return get<Watchlist>(`/watchlists/${id}`);
}

export async function createWatchlist(name: string): Promise<Watchlist> {
  return post<Watchlist>('/watchlists', { name });
}

export async function updateWatchlist(id: number, name: string): Promise<Watchlist> {
  return put<Watchlist>(`/watchlists/${id}`, { name });
}

export async function deleteWatchlist(id: number): Promise<void> {
  return del<void>(`/watchlists/${id}`);
}

export async function addWatchlistItem(
  watchlistId: number,
  symbol: string,
  notes?: string,
): Promise<WatchlistItem> {
  return post<WatchlistItem>(`/watchlists/${watchlistId}/items`, { symbol, notes });
}

export async function deleteWatchlistItem(itemId: number): Promise<void> {
  return del<void>(`/watchlist-items/${itemId}`);
}
