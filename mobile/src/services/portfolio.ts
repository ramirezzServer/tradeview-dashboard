import { get, post, put, del } from './api';
import type { Portfolio, PortfolioItem } from '../types/market';

export async function fetchPortfolios(): Promise<Portfolio[]> {
  return get<Portfolio[]>('/portfolios');
}

export async function fetchPortfolio(id: number): Promise<Portfolio> {
  return get<Portfolio>(`/portfolios/${id}`);
}

export async function createPortfolio(name: string): Promise<Portfolio> {
  return post<Portfolio>('/portfolios', { name });
}

export async function updatePortfolio(id: number, name: string): Promise<Portfolio> {
  return put<Portfolio>(`/portfolios/${id}`, { name });
}

export async function deletePortfolio(id: number): Promise<void> {
  return del<void>(`/portfolios/${id}`);
}

export async function addPortfolioItem(
  portfolioId: number,
  symbol:      string,
  quantity:    number,
  avg_cost:    number,
  notes?:      string,
): Promise<PortfolioItem> {
  return post<PortfolioItem>(`/portfolios/${portfolioId}/items`, {
    symbol,
    quantity,
    avg_cost,
    notes,
  });
}

export async function updatePortfolioItem(
  itemId:   number,
  updates:  Partial<Pick<PortfolioItem, 'quantity' | 'avg_cost' | 'notes'>>,
): Promise<PortfolioItem> {
  return put<PortfolioItem>(`/portfolio-items/${itemId}`, updates);
}

export async function deletePortfolioItem(itemId: number): Promise<void> {
  return del<void>(`/portfolio-items/${itemId}`);
}
