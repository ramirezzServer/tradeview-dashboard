// ─── Backend Proxy Service ────────────────────────────────────────────────────
// All market data now goes through the Laravel backend at VITE_API_BASE_URL.
// The Finnhub API key is never present in the frontend — the backend holds it.
//
// Function signatures and return types are intentionally unchanged so that all
// existing hooks, pages, and components continue to work without modification.
// ─────────────────────────────────────────────────────────────────────────────

import { dedupeMarketRequest, getCachedMarketData, setCachedMarketData } from '@/lib/marketCache';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

/**
 * True when the backend URL is configured in the environment.
 * Replaces the old Finnhub key check — hooks use this guard unchanged.
 */
export function isFinnhubConfigured(): boolean {
  return API_BASE.length > 0;
}

// ─── Types (unchanged — hooks and pages depend on these shapes) ───────────────

export interface FinnhubQuote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // change %
  h: number;   // high
  l: number;   // low
  o: number;   // open
  pc: number;  // previous close
  t: number;   // timestamp
}

export interface BatchQuoteResult {
  success: boolean;
  quote: FinnhubQuote | null;
  message?: string;
  meta?: {
    symbol: string;
    provider: 'finnhub';
  };
}

export type BatchQuotesResponse = Record<string, BatchQuoteResult>;

export interface FinnhubCandle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: string;
  meta?: {
    symbol: string;
    provider: 'finnhub' | 'alphavantage' | 'calculated' | 'simulated' | 'coingecko';
    count: number;
  };
}

export interface FinnhubNewsItem {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface FinnhubBasicFinancials {
  metric: Record<string, number | null>;
  metricType: string;
  symbol: string;
}

export interface MarketIndexQuote {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  source: 'finnhub' | 'simulated';
  reason?: string;
}

export interface SectorPerformance {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  weight?: number;
  status?: 'advancing' | 'declining' | 'neutral';
  source: 'finnhub' | 'simulated';
  reason?: string;
}

const FALLBACK_INDICES: MarketIndexQuote[] = [
  { name: 'S&P 500', symbol: 'SPY', price: 512.4, change: 2.9, changePercent: 0.57, previousClose: 509.5, source: 'simulated', reason: 'frontend fallback' },
  { name: 'NASDAQ', symbol: 'QQQ', price: 438.2, change: 4.1, changePercent: 0.94, previousClose: 434.1, source: 'simulated', reason: 'frontend fallback' },
  { name: 'DOW', symbol: 'DIA', price: 389.7, change: -0.8, changePercent: -0.21, previousClose: 390.5, source: 'simulated', reason: 'frontend fallback' },
  { name: 'Russell 2000', symbol: 'IWM', price: 204.6, change: 1.2, changePercent: 0.59, previousClose: 203.4, source: 'simulated', reason: 'frontend fallback' },
  { name: 'VIX', symbol: 'UVXY', price: 21.8, change: -0.4, changePercent: -1.8, previousClose: 22.2, source: 'simulated', reason: 'frontend fallback' },
];

export const FALLBACK_SECTORS: SectorPerformance[] = [
  { name: 'Technology', symbol: 'XLK', weight: 28.5, price: 214.2, change: 2.1, changePercent: 0.99, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Healthcare', symbol: 'XLV', weight: 13.2, price: 144.8, change: 0.3, changePercent: 0.21, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Financials', symbol: 'XLF', weight: 12.8, price: 42.6, change: -0.1, changePercent: -0.24, status: 'declining', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Consumer Discretionary', symbol: 'XLY', weight: 10.4, price: 181.5, change: 1.1, changePercent: 0.61, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Communication Services', symbol: 'XLC', weight: 6.8, price: 83.4, change: 0.5, changePercent: 0.6, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Industrials', symbol: 'XLI', weight: 8.9, price: 121.3, change: 0.2, changePercent: 0.17, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Consumer Staples', symbol: 'XLP', weight: 5.3, price: 76.1, change: -0.2, changePercent: -0.26, status: 'declining', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Energy', symbol: 'XLE', weight: 7.6, price: 91.7, change: -0.7, changePercent: -0.76, status: 'declining', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Utilities', symbol: 'XLU', weight: 4.2, price: 68.9, change: 0.0, changePercent: 0.03, status: 'neutral', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Real Estate', symbol: 'XLRE', weight: 3.8, price: 38.4, change: -0.1, changePercent: -0.31, status: 'declining', source: 'simulated', reason: 'frontend fallback' },
  { name: 'Materials', symbol: 'XLB', weight: 2.5, price: 88.6, change: 0.4, changePercent: 0.45, status: 'advancing', source: 'simulated', reason: 'frontend fallback' },
];

// ─── Internal HTTP helper ─────────────────────────────────────────────────────

/**
 * GET a Laravel backend endpoint and unwrap the standard
 * { success, message, data } response envelope.
 */
type RequestOptions = {
  signal?: AbortSignal;
  cacheTtlMs?: number;
};

async function fetchFromBackend<T>(
  path: string,
  params: Record<string, string | number> = {},
  options: RequestOptions = {}
): Promise<T> {
  if (!API_BASE) {
    throw new Error('BACKEND_NOT_CONFIGURED');
  }

  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const cacheKey = `finnhub:${url.pathname}?${url.searchParams.toString()}`;
  if (options.cacheTtlMs) {
    const cached = getCachedMarketData<T>(cacheKey);
    if (cached) return cached;
  }

  const runFetch = async (): Promise<T> => {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  options.signal?.addEventListener('abort', abortFromParent, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('PROVIDER_FORBIDDEN');
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);

    // Unwrap Laravel envelope: { success, message, data, meta? }
    const json = (await response.json()) as {
      success: boolean;
      message: string;
      data: T;
    };

    if (!json.success) {
      throw new Error(json.message ?? 'BACKEND_ERROR');
    }

    return options.cacheTtlMs
      ? setCachedMarketData(cacheKey, json.data, options.cacheTtlMs)
      : json.data;

  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('REQUEST_TIMEOUT');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromParent);
  }
  };

  return options.signal
    ? runFetch()
    : dedupeMarketRequest(cacheKey, runFetch);
}

// ─── Public API functions (same signatures as before) ────────────────────────

/** Live stock quote via Laravel → Finnhub /quote */
export async function getQuote(symbol: string, options?: RequestOptions): Promise<FinnhubQuote> {
  return fetchFromBackend<FinnhubQuote>(
    `/market/quote/${encodeURIComponent(symbol)}`,
    {},
    { ...options, cacheTtlMs: options?.cacheTtlMs ?? 20_000 }
  );
}

/** Batched stock quotes via Laravel. One failed symbol returns only that symbol as unavailable. */
export async function getQuotes(symbols: string[], options?: RequestOptions): Promise<BatchQuotesResponse> {
  const normalized = [...new Set(symbols.map(symbol => symbol.toUpperCase().trim()).filter(Boolean))].slice(0, 20);
  if (normalized.length === 0) return {};

  return fetchFromBackend<BatchQuotesResponse>(
    '/market/quotes',
    { symbols: normalized.join(',') },
    { ...options, cacheTtlMs: options?.cacheTtlMs ?? 20_000 }
  );
}

/**
 * OHLCV candle data via Laravel → Finnhub /stock/candle
 *
 * NOTE: This endpoint requires a paid Finnhub plan.
 * With a free key the backend returns 403, which this function re-throws as
 * PLAN_RESTRICTION. useFinnhubCandles catches that and falls back to mock data.
 */
export async function getCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  options?: RequestOptions
): Promise<FinnhubCandle> {
  return fetchFromBackend<FinnhubCandle>(
    `/market/candles/${encodeURIComponent(symbol)}`,
    { resolution, from, to },
    { ...options, cacheTtlMs: options?.cacheTtlMs ?? 3 * 60_000 }
  );
}

/**
 * OHLCV candle data via Laravel → Alpha Vantage (daily resolution only).
 *
 * Called automatically by useFinnhubCandles when the primary Finnhub candle
 * endpoint returns PLAN_RESTRICTION.  Returns the same FinnhubCandle shape so
 * no changes are needed in the chart hook or component.
 */
export async function getAlternativeCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  options?: RequestOptions
): Promise<FinnhubCandle> {
  return fetchFromBackend<FinnhubCandle>(
    `/market/candles-alt/${encodeURIComponent(symbol)}`,
    { resolution, from, to },
    { ...options, cacheTtlMs: options?.cacheTtlMs ?? 5 * 60_000 }
  );
}

/** Crypto OHLCV via Laravel â†’ CoinGecko with simulated fallback. */
export async function getCryptoCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  options?: RequestOptions
): Promise<FinnhubCandle> {
  return fetchFromBackend<FinnhubCandle>(
    `/market/crypto/ohlcv/${encodeURIComponent(symbol)}`,
    { resolution, from, to },
    { ...options, cacheTtlMs: options?.cacheTtlMs ?? 3 * 60_000 }
  );
}

/** General market news via Laravel → Finnhub /news */
export async function getMarketNews(
  category = 'general',
  minId = 0
): Promise<FinnhubNewsItem[]> {
  return fetchFromBackend<FinnhubNewsItem[]>('/market/news', { category, minId }, { cacheTtlMs: 3 * 60_000 });
}

/** Company-specific news via Laravel → Finnhub /company-news */
export async function getCompanyNews(
  symbol: string,
  from: string,
  to: string
): Promise<FinnhubNewsItem[]> {
  return fetchFromBackend<FinnhubNewsItem[]>(
    `/market/company-news/${encodeURIComponent(symbol)}`,
    { from, to },
    { cacheTtlMs: 3 * 60_000 }
  );
}

/** Company profile via Laravel → Finnhub /stock/profile2 */
export async function getCompanyProfile(symbol: string): Promise<FinnhubProfile> {
  return fetchFromBackend<FinnhubProfile>(
    `/market/profile/${encodeURIComponent(symbol)}`,
    {},
    { cacheTtlMs: 60 * 60_000 }
  );
}

/** Basic financial metrics via Laravel → Finnhub /stock/metric */
export async function getBasicFinancials(symbol: string): Promise<FinnhubBasicFinancials> {
  return fetchFromBackend<FinnhubBasicFinancials>(
    `/market/financials/${encodeURIComponent(symbol)}`,
    {},
    { cacheTtlMs: 60 * 60_000 }
  );
}

export async function getMarketIndices(): Promise<MarketIndexQuote[]> {
  try {
    return await fetchFromBackend<MarketIndexQuote[]>('/market/indices', {}, { cacheTtlMs: 60_000 });
  } catch {
    return FALLBACK_INDICES;
  }
}

export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  try {
    return await fetchFromBackend<SectorPerformance[]>('/market/sectors', {}, { cacheTtlMs: 10 * 60_000 });
  } catch {
    return FALLBACK_SECTORS;
  }
}
