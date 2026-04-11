// ─── CoinGecko Proxy Service ──────────────────────────────────────────────────
// All crypto price calls go through the Laravel backend at VITE_API_BASE_URL.
// The backend caches CoinGecko responses (30s TTL) to respect their rate limits.
//
// Response shape is intentionally identical to FinnhubQuote so callers can treat
// stocks and crypto uniformly without special-casing the asset class.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

// ─── Crypto symbols that this backend proxy can price ────────────────────────
// Must mirror CoinGeckoService::SYMBOL_MAP in the backend.
export const SUPPORTED_CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA',
  'DOGE', 'DOT', 'AVAX', 'LINK', 'LTC', 'MATIC', 'SHIB', 'UNI',
]);

export function isCryptoSymbol(symbol: string): boolean {
  return SUPPORTED_CRYPTO_SYMBOLS.has(symbol.toUpperCase());
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Normalized crypto quote — same scalar fields as FinnhubQuote so code
 * can work with stocks and crypto without branching on asset class.
 */
export interface CryptoQuote {
  c: number;           // current price (USD)
  d: number;           // 24-hour dollar change
  dp: number;          // 24-hour percent change
  market_cap?: number;
  source: 'coingecko';
}

// ─── Fetch function ───────────────────────────────────────────────────────────

/**
 * Fetch current prices for one or more crypto symbols.
 * Returns an empty object on any error so callers never crash.
 */
export async function getCryptoPrices(
  symbols: string[]
): Promise<Record<string, CryptoQuote>> {
  const clean = symbols
    .map(s => s.toUpperCase().trim())
    .filter(s => SUPPORTED_CRYPTO_SYMBOLS.has(s));

  if (!API_BASE || clean.length === 0) return {};

  const url = new URL(`${API_BASE}/api/market/crypto/prices`);
  url.searchParams.set('symbols', clean.join(','));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) return {};

    const json = await res.json() as { success: boolean; data: Record<string, CryptoQuote> };
    return json.success ? json.data : {};
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}
