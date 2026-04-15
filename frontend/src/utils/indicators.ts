// ─── Technical Indicator Calculations ────────────────────────────────────────
// All formulas use standard textbook definitions.
// Inputs are arrays of close prices (or OHLCV where noted), oldest-first.
// ─────────────────────────────────────────────────────────────────────────────

/** Simple Moving Average */
export function sma(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const result: number[] = [];
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

/** Exponential Moving Average */
export function ema(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  // Seed with SMA of first `period` values
  const seed = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(seed);
  for (let i = period; i < closes.length; i++) {
    result.push(closes[i] * k + result[result.length - 1] * (1 - k));
  }
  return result;
}

/**
 * Relative Strength Index (Wilder smoothing)
 * Returns a single value for the last data point.
 */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  // Initial averages (simple mean for first period)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Wilder smoothing for remaining bars
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

/** RSI for all bars (returns array aligned to closes[period..]) */
export function rsiSeries(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  const result: number[] = [];
  for (let end = period + 1; end <= closes.length; end++) {
    const val = rsi(closes.slice(0, end), period);
    if (val !== null) result.push(val);
  }
  return result;
}

export interface MACDResult {
  macdLine:   number;
  signalLine: number;
  histogram:  number;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Standard params: fast=12, slow=26, signal=9
 */
export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDResult | null {
  if (closes.length < slow + signal) return null;

  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);

  // Align: fastEma starts at index (fast-1), slowEma at (slow-1)
  // After ema(), result[0] = SMA seed, result[k] = ema at closes[fast-1+k]
  // We need to align them to the same closes index.
  const offset = slow - fast; // fastEma is `offset` longer than slowEma
  const macdLine = slowEma.map((v, i) => fastEma[i + offset] - v);

  const signalEma = ema(macdLine, signal);

  const last = macdLine[macdLine.length - 1];
  const sig  = signalEma[signalEma.length - 1];

  return {
    macdLine:   parseFloat(last.toFixed(4)),
    signalLine: parseFloat(sig.toFixed(4)),
    histogram:  parseFloat((last - sig).toFixed(4)),
  };
}

export interface BollingerBands {
  upper:  number;
  middle: number;
  lower:  number;
}

/**
 * Bollinger Bands (20-period SMA ± 2 standard deviations by default)
 */
export function bollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): BollingerBands | null {
  if (closes.length < period) return null;

  const slice  = closes.slice(-period);
  const mean   = slice.reduce((a, b) => a + b, 0) / period;
  const sqDiff = slice.map(v => (v - mean) ** 2);
  const stdDev = Math.sqrt(sqDiff.reduce((a, b) => a + b, 0) / period);

  return {
    upper:  parseFloat((mean + multiplier * stdDev).toFixed(4)),
    middle: parseFloat(mean.toFixed(4)),
    lower:  parseFloat((mean - multiplier * stdDev).toFixed(4)),
  };
}

/** Last value of SMA or null if insufficient data */
export function smaLast(closes: number[], period: number): number | null {
  const s = sma(closes, period);
  return s.length > 0 ? parseFloat(s[s.length - 1].toFixed(4)) : null;
}

/** Last value of EMA or null if insufficient data */
export function emaLast(closes: number[], period: number): number | null {
  const e = ema(closes, period);
  return e.length > 0 ? parseFloat(e[e.length - 1].toFixed(4)) : null;
}

/** Signal label for an MA relative to current price */
export function maBias(currentPrice: number, ma: number | null): 'Buy' | 'Sell' | 'N/A' {
  if (ma === null) return 'N/A';
  return currentPrice > ma ? 'Buy' : 'Sell';
}

/** Classic pivot point calculation from last bar's H/L/C */
export function pivotPoints(high: number, low: number, close: number) {
  const pivot = (high + low + close) / 3;
  return {
    R3: pivot + (high - low) * 2,
    R2: pivot + (high - low),
    R1: pivot * 2 - low,
    Pivot: pivot,
    S1: pivot * 2 - high,
    S2: pivot - (high - low),
    S3: pivot - (high - low) * 2,
  };
}

/** RSI interpretation */
export function rsiSignal(value: number): { signal: string; color: string } {
  if (value >= 70) return { signal: 'Overbought', color: 'text-bear' };
  if (value >= 60) return { signal: 'Bullish',    color: 'text-bull' };
  if (value <= 30) return { signal: 'Oversold',   color: 'text-bull' };
  if (value <= 40) return { signal: 'Bearish',    color: 'text-bear' };
  return { signal: 'Neutral', color: 'text-chart-accent' };
}

/** MACD interpretation */
export function macdSignal(result: MACDResult): { signal: string; color: string } {
  if (result.histogram > 0 && result.macdLine > 0) return { signal: 'Bullish', color: 'text-bull' };
  if (result.histogram < 0 && result.macdLine < 0) return { signal: 'Bearish', color: 'text-bear' };
  if (result.histogram > 0) return { signal: 'Improving', color: 'text-bull' };
  return { signal: 'Weakening', color: 'text-bear' };
}
