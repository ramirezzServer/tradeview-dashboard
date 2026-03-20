const API_KEY = (import.meta.env.VITE_FINNHUB_API_KEY ?? "").trim();
const BASE_URL = "https://finnhub.io/api/v1";

function buildUrl(
  path: string,
  params: Record<string, string | number | undefined> = {}
): string {
  const url = new URL(`${BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  if (API_KEY) {
    url.searchParams.set("token", API_KEY);
  }

  return url.toString();
}

export function isFinnhubConfigured(): boolean {
  return API_KEY.length > 0;
}

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
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

type FetchJsonOptions = {
  timeoutMs?: number;
};

async function fetchJson<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  options: FetchJsonOptions = {}
): Promise<T> {
  if (!API_KEY) {
    throw new Error("FINNHUB_KEY_MISSING");
  }

  const { timeoutMs = 15000 } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestUrl = buildUrl(endpoint, params);
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (response.status === 401) {
      throw new Error("FINNHUB_UNAUTHORIZED");
    }

    if (response.status === 403) {
      throw new Error("FINNHUB_FORBIDDEN");
    }

    if (response.status === 429) {
      throw new Error("FINNHUB_RATE_LIMITED");
    }

    if (!response.ok) {
      throw new Error(`FINNHUB_HTTP_${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("FINNHUB_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  return fetchJson<FinnhubQuote>("/quote", { symbol });
}

export async function getCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<FinnhubCandle> {
  const data = await fetchJson<FinnhubCandle>("/stock/candle", {
    symbol,
    resolution,
    from,
    to,
  });

  if (!data || data.s !== "ok") {
    throw new Error(`FINNHUB_CANDLE_${data?.s ?? "INVALID"}`);
  }

  const hasValidArrays =
    Array.isArray(data.c) &&
    Array.isArray(data.h) &&
    Array.isArray(data.l) &&
    Array.isArray(data.o) &&
    Array.isArray(data.v) &&
    Array.isArray(data.t);

  if (!hasValidArrays) {
    throw new Error("FINNHUB_CANDLE_INVALID_SHAPE");
  }

  if (data.t.length === 0) {
    throw new Error("FINNHUB_CANDLE_EMPTY");
  }

  return data;
}

export async function getMarketNews(
  category: string = "general",
  minId: number = 0
): Promise<FinnhubNewsItem[]> {
  return fetchJson<FinnhubNewsItem[]>("/news", {
    category,
    minId,
  });
}

export async function getCompanyNews(
  symbol: string,
  from: string,
  to: string
): Promise<FinnhubNewsItem[]> {
  return fetchJson<FinnhubNewsItem[]>("/company-news", {
    symbol,
    from,
    to,
  });
}

export async function getCompanyProfile(
  symbol: string
): Promise<FinnhubProfile> {
  return fetchJson<FinnhubProfile>("/stock/profile2", { symbol });
}

export async function getBasicFinancials(
  symbol: string
): Promise<FinnhubBasicFinancials> {
  return fetchJson<FinnhubBasicFinancials>("/stock/metric", {
    symbol,
    metric: "all",
  });
}