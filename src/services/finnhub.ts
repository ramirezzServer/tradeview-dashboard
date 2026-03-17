const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE = 'https://finnhub.io/api/v1';

function url(path: string, params: Record<string, string> = {}) {
  const p = new URLSearchParams({ ...params, token: API_KEY });
  return `${BASE}${path}?${p}`;
}

export function isFinnhubConfigured(): boolean {
  return !!API_KEY;
}

export interface FinnhubQuote {
  c: number;  // current
  d: number;  // change
  dp: number; // change percent
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
  t: number;  // timestamp
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

async function fetchJson<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) throw new Error('FINNHUB_KEY_MISSING');
  const res = await fetch(url(endpoint, params));
  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  return fetchJson<FinnhubQuote>('/quote', { symbol });
}

export async function getCandles(symbol: string, resolution: string, from: number, to: number): Promise<FinnhubCandle> {
  return fetchJson<FinnhubCandle>('/stock/candle', {
    symbol,
    resolution,
    from: from.toString(),
    to: to.toString(),
  });
}

export async function getMarketNews(category = 'general', minId = 0): Promise<FinnhubNewsItem[]> {
  return fetchJson<FinnhubNewsItem[]>('/news', { category, minId: minId.toString() });
}

export async function getCompanyNews(symbol: string, from: string, to: string): Promise<FinnhubNewsItem[]> {
  return fetchJson<FinnhubNewsItem[]>('/company-news', { symbol, from, to });
}

export async function getCompanyProfile(symbol: string): Promise<FinnhubProfile> {
  return fetchJson<FinnhubProfile>('/stock/profile2', { symbol });
}

export async function getBasicFinancials(symbol: string): Promise<FinnhubBasicFinancials> {
  return fetchJson<FinnhubBasicFinancials>('/stock/metric', { symbol, metric: 'all' });
}
