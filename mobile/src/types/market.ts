// ── Finnhub Quote (mirrors backend response) ──────────────────────────────────
export interface Quote {
  c:  number;   // current price
  d:  number;   // change
  dp: number;   // change %
  h:  number;   // high
  l:  number;   // low
  o:  number;   // open
  pc: number;   // previous close
  t:  number;   // timestamp (unix)
}

// ── Market Movers ────────────────────────────────────────────────────────────
export interface LiveMover {
  symbol:        string;
  price:         number;
  change:        number;
  changePercent: number;
  volume:        number;
}

export interface MarketMoversData {
  topGainers:  LiveMover[];
  topLosers:   LiveMover[];
  mostActive:  LiveMover[];
  lastUpdated: string | null;
}

// ── News ─────────────────────────────────────────────────────────────────────
export interface NewsItem {
  id:       number;
  category: string;
  datetime: number;   // unix timestamp
  headline: string;
  image:    string;
  related:  string;
  source:   string;
  summary:  string;
  url:      string;
}

// ── Crypto ───────────────────────────────────────────────────────────────────
export interface CryptoPrice {
  symbol:        string;
  name:          string;
  price:         number;
  change24h:     number;
  changePercent: number;
  marketCap:     number;
  volume24h:     number;
}

// ── Watchlist ─────────────────────────────────────────────────────────────────
export interface WatchlistItem {
  id:         number;
  symbol:     string;
  notes:      string | null;
  sort_order: number;
  created_at: string;
}

export interface Watchlist {
  id:         number;
  name:       string;
  created_at: string;
  items:      WatchlistItem[];
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export interface PortfolioItem {
  id:        number;
  symbol:    string;
  quantity:  number;
  avg_cost:  number;
  notes:     string | null;
  created_at: string;
}

export interface Portfolio {
  id:         number;
  name:       string;
  created_at: string;
  items:      PortfolioItem[];
}
