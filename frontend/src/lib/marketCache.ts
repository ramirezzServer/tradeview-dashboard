interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const PREFIX = 'market-cache:';

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function getCachedMarketData<T>(key: string): T | null {
  const now = Date.now();
  const memory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memory && memory.expiresAt > now) return memory.data;

  if (!canUseSessionStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt <= now) {
      window.sessionStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }
    memoryCache.set(key, entry);
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedMarketData<T>(key: string, data: T, ttlMs: number): T {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  memoryCache.set(key, entry);

  if (canUseSessionStorage()) {
    try {
      window.sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota/private mode should not break market data fetching.
    }
  }

  return data;
}

export function dedupeMarketRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const current = inFlight.get(key) as Promise<T> | undefined;
  if (current) return current;

  const next = fetcher().finally(() => inFlight.delete(key));
  inFlight.set(key, next);
  return next;
}
