// ─── Backend Proxy Service ────────────────────────────────────────────────────
// All market data now goes through the Laravel backend at VITE_API_BASE_URL.
// The Finnhub API key is never present in the frontend — the backend holds it.
//
// Function signatures and return types are intentionally unchanged so that all
// existing hooks, pages, and components continue to work without modification.
// ─────────────────────────────────────────────────────────────────────────────

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

export interface FinnhubCandle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: string;
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

// ─── Internal HTTP helper ─────────────────────────────────────────────────────

/**
 * GET a Laravel backend endpoint and unwrap the standard
 * { success, message, data } response envelope.
 */
async function fetchFromBackend<T>(
  path: string,
  params: Record<string, string | number> = {}
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('PLAN_RESTRICTION');
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

    return json.data;

  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('REQUEST_TIMEOUT');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Public API functions (same signatures as before) ────────────────────────

/** Live stock quote via Laravel → Finnhub /quote */
export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  return fetchFromBackend<FinnhubQuote>(`/api/market/quote/${encodeURIComponent(symbol)}`);
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
  to: number
): Promise<FinnhubCandle> {
  return fetchFromBackend<FinnhubCandle>(
    `/api/market/candles/${encodeURIComponent(symbol)}`,
    { resolution, from, to }
  );
}

/** General market news via Laravel → Finnhub /news */
export async function getMarketNews(
  category = 'general',
  minId = 0
): Promise<FinnhubNewsItem[]> {
  return fetchFromBackend<FinnhubNewsItem[]>('/api/market/news', { category, minId });
}

/**
 * Company-specific news.
 * No backend proxy endpoint exists yet — callers will receive an error and
 * should fall back to mock data.
 */
export async function getCompanyNews(
  _symbol: string,
  _from: string,
  _to: string
): Promise<FinnhubNewsItem[]> {
  throw new Error('ENDPOINT_NOT_PROXIED');
}

/** Company profile via Laravel → Finnhub /stock/profile2 */
export async function getCompanyProfile(symbol: string): Promise<FinnhubProfile> {
  return fetchFromBackend<FinnhubProfile>(`/api/market/profile/${encodeURIComponent(symbol)}`);
}

/** Basic financial metrics via Laravel → Finnhub /stock/metric */
export async function getBasicFinancials(symbol: string): Promise<FinnhubBasicFinancials> {
  return fetchFromBackend<FinnhubBasicFinancials>(
    `/api/market/financials/${encodeURIComponent(symbol)}`
  );
}
