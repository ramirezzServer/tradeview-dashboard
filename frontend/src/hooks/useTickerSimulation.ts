import { useState, useEffect, useRef, useCallback } from 'react';
import { WatchlistAsset } from '@/types/stock';
import { getQuote, isFinnhubConfigured } from '@/services/finnhub';

export function useTickerSimulation(initialAssets: WatchlistAsset[]) {
  const [assets, setAssets] = useState<WatchlistAsset[]>(initialAssets);
  const [flashMap, setFlashMap] = useState<Record<string, 'bull' | 'bear' | null>>({});
  const [isLive, setIsLive] = useState(false);

  // Track whether we've already attempted a live fetch so we don't retry
  // on every render cycle when the parent re-computes the assets array.
  const liveSymbolsRef = useRef<string>('');

  // ── Sync base assets when the caller's list changes (items loaded async) ──
  // Only update entries that haven't already received a live price so we
  // don't regress live-fetched data with stale seed values.
  useEffect(() => {
    if (initialAssets.length === 0) return;

    setAssets(prev => {
      const prevMap = new Map(prev.map(a => [a.symbol, a]));
      return initialAssets.map(incoming => {
        const existing = prevMap.get(incoming.symbol);
        // Keep existing if it already has a live-looking price (i.e., it differs
        // from the seed — a real quote update has already landed).
        if (existing && existing.price !== incoming.price) return existing;
        return incoming;
      });
    });
  }, [initialAssets]);

  // ── Attempt live quote fetch when the symbol set changes ─────────────────
  useEffect(() => {
    if (!isFinnhubConfigured()) return;

    const stockSymbols = initialAssets
      .filter(a => a.type === 'stock')
      .map(a => a.symbol);

    if (stockSymbols.length === 0) return;

    // Deduplicate fetch attempts: only re-fetch if the symbol set changed.
    const symbolKey = [...stockSymbols].sort().join(',');
    if (symbolKey === liveSymbolsRef.current) return;
    liveSymbolsRef.current = symbolKey;

    Promise.allSettled(stockSymbols.map(s => getQuote(s))).then(results => {
      let liveCount = 0;

      setAssets(prev => {
        const updated = [...prev];
        stockSymbols.forEach((sym, idx) => {
          const r = results[idx];
          if (r.status === 'fulfilled' && r.value.c > 0) {
            liveCount++;
            const i = updated.findIndex(a => a.symbol === sym);
            if (i !== -1) {
              const q = r.value;
              updated[i] = { ...updated[i], price: q.c, change: q.d, changePercent: q.dp };
            }
          }
        });
        return updated;
      });

      // Only declare "Live" if at least one valid quote came back.
      setIsLive(liveCount > 0);
    });
  }, [initialAssets]);

  // ── Simulation tick ───────────────────────────────────────────────────────
  // Provides price movement animation between live refreshes.
  // Runs regardless of isLive so the UI always has motion.
  const tick = useCallback(() => {
    const flashes: Record<string, 'bull' | 'bear'> = {};

    setAssets(prev =>
      prev.map(asset => {
        if (Math.random() > 0.4) return asset;
        const delta = (Math.random() - 0.48) * asset.price * 0.002;
        const newPrice = +(asset.price + delta).toFixed(2);
        const base = newPrice - asset.change;
        const newChange = +(newPrice - base).toFixed(2);
        const newPercent = base !== 0 ? +((newChange / base) * 100).toFixed(2) : 0;

        flashes[asset.symbol] = delta >= 0 ? 'bull' : 'bear';
        return { ...asset, price: newPrice, change: newChange, changePercent: newPercent };
      })
    );

    // Apply flash colours outside the setAssets updater to avoid nested setState.
    if (Object.keys(flashes).length > 0) {
      setFlashMap(prev => ({ ...prev, ...flashes }));
      setTimeout(
        () => setFlashMap(prev => {
          const cleared = { ...prev };
          Object.keys(flashes).forEach(k => { cleared[k] = null; });
          return cleared;
        }),
        600
      );
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(tick, 2000);
    return () => clearInterval(timer);
  }, [tick]);

  return { assets, flashMap, isLive };
}
