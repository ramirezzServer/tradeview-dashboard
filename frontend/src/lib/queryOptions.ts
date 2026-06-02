export const queryFreshness = {
  quote: 10_000,
  quoteBatch: 20_000,
  cryptoPrice: 25_000,
  candles: 3 * 60_000,
  news: 3 * 60_000,
  userData: 60_000,
  settings: 5 * 60_000,
  fundamentals: 60 * 60_000,
} as const;

export const queryGc = {
  short: 5 * 60_000,
  userData: 15 * 60_000,
  long: 2 * 60 * 60_000,
} as const;

export function retryUnlessClientError(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('HTTP_400') ||
    message.includes('HTTP_401') ||
    message.includes('HTTP_403') ||
    message.includes('HTTP_404') ||
    message.includes('HTTP_422') ||
    message.includes('RATE_LIMITED') ||
    message.includes('UNAUTHORIZED') ||
    message.includes('PROVIDER_FORBIDDEN')
  ) {
    return false;
  }

  return true;
}
