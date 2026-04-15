import { useState, useEffect, useCallback } from 'react';

/** Converts an epoch-ms timestamp into a human-readable relative string. */
export function formatTimeAgo(epochMs: number): string {
  const diffSec = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSec < 5)   return 'just now';
  if (diffSec < 60)  return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

/** Freshness tier used for badge styling. */
export type FreshnessTier = 'fresh' | 'aging' | 'stale';

export function freshnessTier(epochMs: number): FreshnessTier {
  const diffSec = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSec < 60)  return 'fresh';
  if (diffSec < 300) return 'aging';
  return 'stale';
}

/**
 * Returns a live-updating relative time string and freshness tier for a given
 * epoch-ms timestamp. Re-renders every `intervalMs` milliseconds (default 10s).
 *
 * Usage:
 *   const { timeAgo, tier } = useTimeAgo(quote.fetchedAt);
 */
export function useTimeAgo(epochMs: number | null | undefined, intervalMs = 10_000) {
  const compute = useCallback(() => ({
    timeAgo: epochMs ? formatTimeAgo(epochMs) : null,
    tier:    epochMs ? freshnessTier(epochMs) : ('stale' as FreshnessTier),
  }), [epochMs]);

  const [state, setState] = useState(compute);

  useEffect(() => {
    setState(compute());
    const id = setInterval(() => setState(compute()), intervalMs);
    return () => clearInterval(id);
  }, [compute, intervalMs]);

  return state;
}
