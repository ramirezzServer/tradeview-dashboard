import { describe, it, expect, vi } from 'vitest';
import { mapCandles, normalizeCandleResponse, getRange, fetchCandlesWithFallback } from '../candleFallback';
import type { CandleDeps } from '../candleFallback';
import type { FinnhubCandle } from '@/services/finnhub';

// ─── mapCandles ───────────────────────────────────────────────────────────────

describe('mapCandles', () => {
  it('returns empty array when status is not ok', () => {
    const raw = { s: 'no_data', t: [], o: [], h: [], l: [], c: [], v: [] } as FinnhubCandle;
    expect(mapCandles(raw)).toEqual([]);
  });

  it('returns empty array when timestamps are missing', () => {
    const raw = { s: 'ok' } as unknown as FinnhubCandle;
    expect(mapCandles(raw)).toEqual([]);
  });

  it('maps raw candle data to OHLCVData shape', () => {
    const raw: FinnhubCandle = {
      s: 'ok',
      t: [1700000000],
      o: [100], h: [110], l: [90], c: [105], v: [1000],
    };
    const result = mapCandles(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ open: 100, high: 110, low: 90, close: 105, volume: 1000 });
    expect(result[0].time).toBe(1700000000);
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('maps multiple candles preserving index alignment', () => {
    const raw: FinnhubCandle = {
      s: 'ok',
      t: [1700000000, 1700086400],
      o: [100, 106], h: [110, 112], l: [90, 104], c: [105, 108], v: [1000, 2000],
    };
    const result = mapCandles(raw);
    expect(result).toHaveLength(2);
    expect(result[1].open).toBe(106);
    expect(result[1].volume).toBe(2000);
  });

  it('normalizes wrapped backend candle envelopes', () => {
    const raw: FinnhubCandle = {
      s: 'ok',
      t: [1700000000, 1700086400],
      o: [100, 106], h: [110, 112], l: [90, 104], c: [105, 108], v: [0, 0],
      meta: { symbol: 'AAPL', provider: 'calculated', count: 2 },
    };
    const result = normalizeCandleResponse({ success: true, data: raw });
    expect(result).toHaveLength(2);
    expect(result[0].volume).toBe(0);
  });

  it('normalizes uneven arrays to the shortest aligned length', () => {
    const raw: FinnhubCandle = {
      s: 'ok',
      t: [1700000000, 1700086400, 1700172800],
      o: [100, 106], h: [110, 112], l: [90, 104], c: [105, 108], v: [0, 0],
    };
    expect(normalizeCandleResponse(raw)).toHaveLength(2);
  });
});

// ─── getRange ─────────────────────────────────────────────────────────────────

describe('getRange', () => {
  it('returns 60-minute resolution for 1W', () => {
    expect(getRange('1W').resolution).toBe('60');
  });

  it('returns daily resolution for 1M', () => {
    expect(getRange('1M').resolution).toBe('D');
  });

  it('returns daily resolution for 3M', () => {
    expect(getRange('3M').resolution).toBe('D');
  });

  it('from is always earlier than to', () => {
    for (const tf of ['1W', '1M', '3M'] as const) {
      const { from, to } = getRange(tf);
      expect(from).toBeLessThan(to);
    }
  });

  it('1W range spans approximately 7 days', () => {
    const { from, to } = getRange('1W');
    expect(to - from).toBeCloseTo(7 * 86400, -3);
  });

  it('3M range spans approximately 90 days', () => {
    const { from, to } = getRange('3M');
    expect(to - from).toBeCloseTo(90 * 86400, -3);
  });
});

// ─── fetchCandlesWithFallback ─────────────────────────────────────────────────

const validCandle: FinnhubCandle = {
  s: 'ok',
  t: [1700000000, 1700086400],
  o: [100, 105], h: [110, 112], l: [90, 101], c: [105, 108], v: [1000, 0],
};

const ARGS: [string, string, number, number] = ['AAPL', 'D', 1700000000, 1700086400];

describe('fetchCandlesWithFallback', () => {
  it('returns finnhub data when primary succeeds', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockResolvedValue(validCandle),
      getAlternativeCandles: vi.fn(),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('finnhub');
    expect(result.data).toHaveLength(2);
    expect(deps.getAlternativeCandles).not.toHaveBeenCalled();
  });

  it('falls back to alphavantage on PLAN_RESTRICTION', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockRejectedValue(new Error('PLAN_RESTRICTION')),
      getAlternativeCandles: vi.fn().mockResolvedValue(validCandle),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('alphavantage');
    expect(deps.getAlternativeCandles).toHaveBeenCalledOnce();
  });

  it('falls back to alphavantage on ACCESS_FORBIDDEN', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockRejectedValue(new Error('ACCESS_FORBIDDEN')),
      getAlternativeCandles: vi.fn().mockResolvedValue(validCandle),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('alphavantage');
  });

  it('falls back to alphavantage on rate limits', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockRejectedValue(new Error('RATE_LIMITED')),
      getAlternativeCandles: vi.fn().mockResolvedValue(validCandle),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('alphavantage');
  });

  it('falls back when finnhub returns empty candles', async () => {
    const empty: FinnhubCandle = { s: 'ok', t: [], o: [], h: [], l: [], c: [], v: [] };
    const deps: CandleDeps = {
      getCandles: vi.fn().mockResolvedValue(empty),
      getAlternativeCandles: vi.fn().mockResolvedValue(validCandle),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('alphavantage');
  });

  it('falls back when the primary backend returns no candle data as 404', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockRejectedValue(new Error('HTTP_404')),
      getAlternativeCandles: vi.fn().mockResolvedValue(validCandle),
    };
    const result = await fetchCandlesWithFallback(...ARGS, deps);
    expect(result.provider).toBe('alphavantage');
  });

  it('normalizes fallback errors when fallback also fails', async () => {
    const deps: CandleDeps = {
      getCandles: vi.fn().mockRejectedValue(new Error('PLAN_RESTRICTION')),
      getAlternativeCandles: vi.fn().mockRejectedValue(new Error('AV_RATE_LIMITED')),
    };
    await expect(fetchCandlesWithFallback(...ARGS, deps)).rejects.toThrow('FALLBACK_FAILED');
  });
});
