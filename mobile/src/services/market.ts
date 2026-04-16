/**
 * Market service — all public Finnhub/AlphaVantage/CoinGecko proxy endpoints.
 * No auth token required. These are public routes on the Laravel backend.
 */
import { get } from './api';
import type {
  Quote,
  MarketMoversData,
  NewsItem,
  CryptoPrice,
} from '../types/market';

// ── Quote ────────────────────────────────────────────────────────────────────

export async function fetchQuote(symbol: string): Promise<Quote> {
  return get<Quote>(`/market/quote/${encodeURIComponent(symbol.toUpperCase())}`);
}

// ── Market Movers ─────────────────────────────────────────────────────────────

interface MoversBackend {
  top_gainers:          MoverRaw[];
  top_losers:           MoverRaw[];
  most_actively_traded: MoverRaw[];
  last_updated:         string | null;
}

interface MoverRaw {
  symbol:        string;
  price:         number;
  change:        number;
  changePercent: number;
  volume:        number;
}

export async function fetchMarketMovers(): Promise<MarketMoversData> {
  const raw = await get<MoversBackend>('/market/movers');
  return {
    topGainers:  raw.top_gainers          ?? [],
    topLosers:   raw.top_losers           ?? [],
    mostActive:  raw.most_actively_traded ?? [],
    lastUpdated: raw.last_updated         ?? null,
  };
}

// ── News ─────────────────────────────────────────────────────────────────────

export async function fetchMarketNews(
  category = 'general',
  minId    = 0,
): Promise<NewsItem[]> {
  return get<NewsItem[]>('/market/news', {
    params: { category, minId },
  });
}

// ── Crypto ───────────────────────────────────────────────────────────────────

interface CryptoBackend {
  symbol:         string;
  name:           string;
  price:          number;
  change_24h:     number;
  change_percent: number;
  market_cap:     number;
  volume_24h:     number;
}

export async function fetchCryptoPrices(symbols: string[]): Promise<CryptoPrice[]> {
  const raw = await get<CryptoBackend[]>('/market/crypto/prices', {
    params: { symbols: symbols.join(',') },
  });

  return (raw ?? []).map((item) => ({
    symbol:        item.symbol,
    name:          item.name,
    price:         item.price,
    change24h:     item.change_24h     ?? 0,
    changePercent: item.change_percent ?? 0,
    marketCap:     item.market_cap     ?? 0,
    volume24h:     item.volume_24h     ?? 0,
  }));
}

// ── Earnings ──────────────────────────────────────────────────────────────────

export interface EarningsItem {
  actual:        number | null;
  estimate:      number | null;
  period:        string;
  surprise:      number | null;
  surprisePercent: number | null;
  symbol:        string;
}

export async function fetchEarnings(symbol: string): Promise<EarningsItem[]> {
  return get<EarningsItem[]>(`/market/earnings/${encodeURIComponent(symbol.toUpperCase())}`);
}
