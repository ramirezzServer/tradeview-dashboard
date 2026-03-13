import { useState, useEffect, useRef, useCallback } from 'react';
import { WatchlistAsset } from '@/types/stock';

export function useTickerSimulation(initialAssets: WatchlistAsset[]) {
  const [assets, setAssets] = useState(initialAssets);
  const [flashMap, setFlashMap] = useState<Record<string, 'bull' | 'bear' | null>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();

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

  return { assets, flashMap };
}
