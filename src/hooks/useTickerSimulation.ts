import { useState, useEffect, useRef, useCallback } from 'react';
import { WatchlistAsset } from '@/types/stock';
import { getQuote, isFinnhubConfigured } from '@/services/finnhub';

export function useTickerSimulation(initialAssets: WatchlistAsset[]) {
  const [assets, setAssets] = useState(initialAssets);
  const [flashMap, setFlashMap] = useState<Record<string, 'bull' | 'bear' | null>>({});
  const [isLive, setIsLive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const hasTriedLive = useRef(false);

  // Try to fetch live quotes on mount
  useEffect(() => {
    if (!isFinnhubConfigured() || hasTriedLive.current) return;
    hasTriedLive.current = true;

    const stockSymbols = initialAssets.filter(a => a.type === 'stock').map(a => a.symbol);

    Promise.allSettled(stockSymbols.map(s => getQuote(s)))
      .then(results => {
        setAssets(prev => {
          const updated = [...prev];
          stockSymbols.forEach((sym, idx) => {
            const r = results[idx];
            if (r.status === 'fulfilled' && r.value.c > 0) {
              const i = updated.findIndex(a => a.symbol === sym);
              if (i !== -1) {
                const q = r.value;
                updated[i] = { ...updated[i], price: q.c, change: q.d, changePercent: q.dp };
              }
            }
          });
          return updated;
        });
        setIsLive(true);
      });
  }, [initialAssets]);

  // Simulation tick for mock movement
  const tick = useCallback(() => {
    setAssets(prev =>
      prev.map(asset => {
        if (Math.random() > 0.4) return asset;
        const delta = (Math.random() - 0.48) * asset.price * 0.002;
        const newPrice = +(asset.price + delta).toFixed(2);
        const newChange = +(newPrice - (asset.price - asset.change)).toFixed(2);
        const newPercent = +((newChange / (newPrice - newChange)) * 100).toFixed(2);

        setFlashMap(prev => ({ ...prev, [asset.symbol]: delta >= 0 ? 'bull' : 'bear' }));
        setTimeout(() => setFlashMap(prev => ({ ...prev, [asset.symbol]: null })), 600);

        return { ...asset, price: newPrice, change: newChange, changePercent: newPercent };
      })
    );
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(tick, 2000);
    return () => clearInterval(timerRef.current);
  }, [tick]);

  return { assets, flashMap, isLive };
}
