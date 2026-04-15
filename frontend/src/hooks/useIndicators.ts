import { useMemo } from 'react';
import { useFinnhubCandles } from './useFinnhubCandles';
import {
  smaLast, emaLast, rsi, macd, bollingerBands,
  maBias, rsiSignal, macdSignal, pivotPoints,
  type MACDResult, type BollingerBands,
} from '@/utils/indicators';
import { OHLCVData } from '@/types/stock';

export interface IndicatorSummary {
  // Price
  currentPrice:  number;
  lastDate:      string;

  // Moving averages
  sma10:   number | null;
  sma20:   number | null;
  sma50:   number | null;
  sma100:  number | null;
  sma200:  number | null;
  ema10:   number | null;
  ema20:   number | null;
  ema50:   number | null;

  // Oscillators
  rsiValue:    number | null;
  rsiSignal:   { signal: string; color: string };
  macdResult:  MACDResult | null;
  macdSignal:  { signal: string; color: string };
  bbands:      BollingerBands | null;

  // Signal count
  buyCount:    number;
  sellCount:   number;
  neutralCount: number;

  // Pivots (from last bar)
  pivots: ReturnType<typeof pivotPoints> | null;

  // Trend chart data (last 60 bars with MA overlays)
  chartData: Array<{ date: string; price: number; ma20: number | null; ma50: number | null }>;
}

function calcIndicators(candles: OHLCVData[]): IndicatorSummary {
  const closes = candles.map(c => c.close);
  const last   = candles[candles.length - 1];
  const price  = last.close;

  const s10  = smaLast(closes, 10);
  const s20  = smaLast(closes, 20);
  const s50  = smaLast(closes, 50);
  const s100 = smaLast(closes, 100);
  const s200 = smaLast(closes, 200);
  const e10  = emaLast(closes, 10);
  const e20  = emaLast(closes, 20);
  const e50  = emaLast(closes, 50);

  const rsiVal  = rsi(closes, 14);
  const rsiSig  = rsiVal !== null ? rsiSignal(rsiVal) : { signal: 'N/A', color: 'text-muted-foreground' };

  const macdRes = macd(closes, 12, 26, 9);
  const macdSig = macdRes ? macdSignal(macdRes) : { signal: 'N/A', color: 'text-muted-foreground' };

  const bb = bollingerBands(closes, 20, 2);

  // Count signals for the summary bar
  const maValues = [s10, s20, s50, s100, s200, e10, e20, e50];
  let buyCount = 0, sellCount = 0, neutralCount = 0;

  maValues.forEach(v => {
    if (v === null) { neutralCount++; return; }
    if (price > v) buyCount++;
    else sellCount++;
  });

  if (rsiVal !== null) {
    if (rsiVal < 40 || (macdRes && macdRes.histogram > 0)) buyCount++;
    else if (rsiVal > 60) neutralCount++;
    else sellCount++;
  }

  if (macdRes) {
    if (macdRes.histogram > 0) buyCount++;
    else sellCount++;
  }

  // Pivot from last bar
  const pivotData = candles.length >= 1
    ? pivotPoints(last.high, last.low, last.close)
    : null;

  // Chart data — last 60 bars, compute SMA20/SMA50 at each point
  const chartCandles = candles.slice(-60);
  const chartCloses  = candles.map(c => c.close); // full closes for accurate MA
  const sma20Series  = (() => {
    if (closes.length < 20) return [];
    const result: (number | null)[] = new Array(candles.length).fill(null);
    for (let i = 19; i < closes.length; i++) {
      const s = closes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
      result[i] = parseFloat(s.toFixed(4));
    }
    return result;
  })();
  const sma50Series  = (() => {
    if (closes.length < 50) return [];
    const result: (number | null)[] = new Array(candles.length).fill(null);
    for (let i = 49; i < closes.length; i++) {
      const s = closes.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50;
      result[i] = parseFloat(s.toFixed(4));
    }
    return result;
  })();

  const startIdx = candles.length - 60;
  const chartData = chartCandles.map((c, i) => ({
    date:  c.date,
    price: c.close,
    ma20:  sma20Series.length > 0 ? sma20Series[startIdx + i] ?? null : null,
    ma50:  sma50Series.length > 0 ? sma50Series[startIdx + i] ?? null : null,
  }));

  return {
    currentPrice: price,
    lastDate:     last.date,
    sma10: s10, sma20: s20, sma50: s50, sma100: s100, sma200: s200,
    ema10: e10, ema20: e20, ema50: e50,
    rsiValue: rsiVal, rsiSignal: rsiSig,
    macdResult: macdRes, macdSignal: macdSig,
    bbands: bb,
    buyCount, sellCount, neutralCount,
    pivots: pivotData,
    chartData,
  };
}

/**
 * Fetches real OHLCV candle data for a symbol and computes all technical
 * indicators client-side using mathematically correct formulas.
 *
 * Returns null indicators when insufficient candle data is available.
 */
export function useIndicators(symbol: string, timeframe: '1W' | '1M' | '3M' = '3M') {
  const { data: candles, loading, error, provider } = useFinnhubCandles(symbol, timeframe);

  const indicators = useMemo<IndicatorSummary | null>(() => {
    if (!candles || candles.length < 14) return null;
    return calcIndicators(candles);
  }, [candles]);

  return {
    indicators,
    candles,
    loading,
    error,
    provider,
    isLive: !!indicators && !error,
    hasData: candles.length >= 14,
  };
}
