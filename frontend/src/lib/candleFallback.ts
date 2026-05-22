import type { FinnhubCandle } from '@/services/finnhub'
import type { OHLCVData } from '@/types/stock'

export type Timeframe = '1D' | '1W' | '1M' | '3M'
export type CandleProvider = 'finnhub' | 'alphavantage' | 'coingecko' | 'calculated' | 'simulated'
export type CandleResult = { data: OHLCVData[]; provider: CandleProvider }

export type CandleDeps = {
  getCandles: (symbol: string, resolution: string, from: number, to: number, options?: { signal?: AbortSignal }) => Promise<FinnhubCandle>
  getAlternativeCandles: (symbol: string, resolution: string, from: number, to: number, options?: { signal?: AbortSignal }) => Promise<FinnhubCandle>
}

type WrappedCandleResponse = {
  success?: boolean
  data?: FinnhubCandle
}

function unwrapCandleResponse(response: FinnhubCandle | WrappedCandleResponse): FinnhubCandle | null {
  if (!response || typeof response !== 'object') return null
  if ('data' in response && response.data && typeof response.data === 'object') {
    return response.data
  }
  return response as FinnhubCandle
}

export function normalizeCandleResponse(response: FinnhubCandle | WrappedCandleResponse): OHLCVData[] {
  const raw = unwrapCandleResponse(response)
  if (!raw || raw.s !== 'ok' || !raw.t?.length) return []

  const lengths = [raw.t, raw.o, raw.h, raw.l, raw.c, raw.v].map(values => values?.length ?? 0)
  const count = Math.min(...lengths)

  if (count <= 0) return []

  return raw.t.slice(0, count)
    .map((t, i) => ({
      time:   Number(t),
      date:   new Date(t * 1000).toISOString().split('T')[0],
      open:   Number(raw.o[i]),
      high:   Number(raw.h[i]),
      low:    Number(raw.l[i]),
      close:  Number(raw.c[i]),
      volume: Number(raw.v[i] ?? 0),
    }))
    .filter(candle => Number.isFinite(new Date(candle.date).getTime())
      && Number.isFinite(candle.open)
      && Number.isFinite(candle.high)
      && Number.isFinite(candle.low)
      && Number.isFinite(candle.close)
      && Number.isFinite(candle.volume))
}

export const mapCandles = normalizeCandleResponse

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
  'HTTP_404',
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
    if (data.length < 2) throw new Error('EMPTY_CANDLES')
    return { data, provider: 'finnhub' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!FALLBACK_TRIGGERS.has(msg)) throw e

    try {
      const raw  = await deps.getAlternativeCandles(symbol, resolution, from, to, options)
      const data = normalizeCandleResponse(raw)
      if (data.length < 2) throw new Error('EMPTY_CANDLES')
      const provider = raw.meta?.provider ?? 'alphavantage'
      return { data, provider }
    } catch (fallbackError) {
      const msg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      throw new Error(msg === 'EMPTY_CANDLES' ? 'EMPTY_CANDLES' : 'FALLBACK_FAILED')
    }
  }
}
