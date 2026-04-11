<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Alpha Vantage candle data service.
 *
 * Used as a fallback OHLCV provider when Finnhub free plan blocks the candle
 * endpoint.  Returns data in the same array shape as FinnhubService::getCandles()
 * so that the controller layer and frontend hook need no special-casing.
 *
 * Free tier limitations (as of 2025):
 *  - 25 requests / day
 *  - `compact` output size: last ~100 trading days of daily data
 *
 * @see https://www.alphavantage.co/documentation/
 */
class AlphaVantageService
{
    // ─── Configuration ────────────────────────────────────────────────────────

    public function isConfigured(): bool
    {
        $key = config('alphavantage.key', '');
        return ! empty($key) && $key !== 'demo';
    }

    // ─── Public Methods ───────────────────────────────────────────────────────

    /**
     * Fetch daily OHLCV candles and return in Finnhub-compatible format.
     *
     * @param  string  $symbol  Ticker symbol (e.g. "AAPL")
     * @param  int     $from    Start of range as Unix timestamp
     * @param  int     $to      End of range as Unix timestamp
     * @return array{s:string, t:int[], o:float[], h:float[], l:float[], c:float[], v:int[]}
     *
     * @throws RuntimeException  AV_NOT_CONFIGURED | AV_RATE_LIMITED | AV_INVALID_SYMBOL | AV_REQUEST_FAILED
     */
    public function getDailyCandles(string $symbol, int $from, int $to): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('AV_NOT_CONFIGURED');
        }

        $cacheKey = "av:daily:{$symbol}";
        $cacheTtl = config('alphavantage.cache_ttl.daily_candles', 1800);

        $raw = Cache::remember($cacheKey, $cacheTtl, function () use ($symbol) {
            $response = Http::timeout(20)->get(config('alphavantage.base_url'), [
                'function'   => 'TIME_SERIES_DAILY',
                'symbol'     => strtoupper($symbol),
                'outputsize' => 'compact', // last ~100 trading days — sufficient for 1W/1M/3M views
                'apikey'     => config('alphavantage.key'),
            ]);

            if (! $response->ok()) {
                Log::warning('AlphaVantage HTTP error', [
                    'symbol' => $symbol,
                    'status' => $response->status(),
                ]);
                return null;
            }

            return $response->json();
        });

        if ($raw === null) {
            throw new RuntimeException('AV_REQUEST_FAILED');
        }

        // AV sends a "Note" when the per-minute or per-day rate limit is hit.
        if (isset($raw['Note']) || isset($raw['Information'])) {
            Log::warning('AlphaVantage rate limit hit', ['symbol' => $symbol]);
            // Clear cache so the next request isn't served stale rate-limit response.
            Cache::forget($cacheKey);
            throw new RuntimeException('AV_RATE_LIMITED');
        }

        if (isset($raw['Error Message'])) {
            throw new RuntimeException('AV_INVALID_SYMBOL');
        }

        if (! isset($raw['Time Series (Daily)'])) {
            return ['s' => 'no_data', 't' => [], 'o' => [], 'h' => [], 'l' => [], 'c' => [], 'v' => []];
        }

        return $this->mapTimeSeries($raw['Time Series (Daily)'], $from, $to);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /**
     * Map the AV "Time Series (Daily)" object into Finnhub's array-of-parallel-arrays
     * format, filtered to the requested [from, to] Unix timestamp range.
     */
    private function mapTimeSeries(array $timeSeries, int $from, int $to): array
    {
        $t = $o = $h = $l = $c = $v = [];

        foreach ($timeSeries as $dateStr => $values) {
            // Treat the bar as closing at 4 pm Eastern on its date.
            $ts = strtotime($dateStr . ' 16:00:00');
            if ($ts === false || $ts < $from || $ts > $to) {
                continue;
            }

            $t[] = $ts;
            $o[] = (float) ($values['1. open']   ?? 0);
            $h[] = (float) ($values['2. high']   ?? 0);
            $l[] = (float) ($values['3. low']    ?? 0);
            $c[] = (float) ($values['4. close']  ?? 0);
            $v[] = (int)   ($values['5. volume'] ?? 0);
        }

        if (empty($t)) {
            return ['s' => 'no_data', 't' => [], 'o' => [], 'h' => [], 'l' => [], 'c' => [], 'v' => []];
        }

        // AV returns newest-first; sort ascending by timestamp to match Finnhub convention.
        array_multisort($t, SORT_ASC, $o, $h, $l, $c, $v);

        return [
            's' => 'ok',
            't' => $t,
            'o' => $o,
            'h' => $h,
            'l' => $l,
            'c' => $c,
            'v' => $v,
        ];
    }
}
