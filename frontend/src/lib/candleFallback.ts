import type { FinnhubCandle } from '@/services/finnhub'
import type { OHLCVData } from '@/types/stock'

export type Timeframe = '1D' | '1W' | '1M' | '3M'
export type CandleProvider = 'finnhub' | 'alphavantage' | 'coingecko'
export type CandleResult = { data: OHLCVData[]; provider: CandleProvider }

export type CandleDeps = {
  getCandles: (symbol: string, resolution: string, from: number, to: number, options?: { signal?: AbortSignal }) => Promise<FinnhubCandle>
  getAlternativeCandles: (symbol: string, resolution: string, from: number, to: number, options?: { signal?: AbortSignal }) => Promise<FinnhubCandle>
}

export function mapCandles(raw: FinnhubCandle): OHLCVData[] {
  if (raw.s !== 'ok' || !raw.t?.length) return []
  if (![raw.o, raw.h, raw.l, raw.c, raw.v].every(values => values?.length === raw.t.length)) return []
  return raw.t.map((t, i) => ({
    date:   new Date(t * 1000).toISOString().split('T')[0],
    open:   raw.o[i],
    high:   raw.h[i],
    low:    raw.l[i],
    close:  raw.c[i],
    volume: raw.v[i],
  }))
}

export function getRange(tf: Timeframe): { from: number; to: number; resolution: string } {
  const to  = Math.floor(Date.now() / 1000)
  const day = 86400
  switch (tf) {
    case '1D': return { from: to - 1  * day, to, resolution: '60' }
    case '1W': return { from: to - 7  * day, to, resolution: '60' }
    case '1M': return { from: to - 30 * day, to, resolution: 'D'  }
    case '3M': return { from: to - 90 * day, to, resolution: 'D'  }
  }
}

// Errors from Finnhub that mean "this plan doesn't cover candles — try the fallback".
const FALLBACK_TRIGGERS = new Set([
  'PROVIDER_FORBIDDEN',
  'PLAN_RESTRICTION',
  'ACCESS_FORBIDDEN',
  'REQUEST_TIMEOUT',
  'EMPTY_CANDLES',
  'NO_DATA',
  'RATE_LIMITED',
  'BACKEND_ERROR',
  'HTTP_422',
  'HTTP_429',
  'HTTP_500',
  'HTTP_502',
  'HTTP_503',
])

export async function fetchCandlesWithFallback(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  deps: CandleDeps,
  options?: { signal?: AbortSignal },
): Promise<CandleResult> {
  try {
    const raw  = await deps.getCandles(symbol, resolution, from, to, options)
    const data = mapCandles(raw)
    if (data.length === 0) throw new Error('EMPTY_CANDLES')
    return { data, provider: 'finnhub' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!FALLBACK_TRIGGERS.has(msg)) throw e

    try {
      const raw  = await deps.getAlternativeCandles(symbol, resolution, from, to, options)
      const data = mapCandles(raw)
      if (data.length === 0) throw new Error('EMPTY_CANDLES')
      return { data, provider: 'alphavantage' }
    } catch {
      throw new Error('FALLBACK_FAILED')
    }
  }
}
