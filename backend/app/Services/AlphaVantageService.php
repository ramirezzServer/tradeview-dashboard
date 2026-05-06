<?php

namespace App\Services;

use App\Exceptions\AlphaVantage\InvalidResponseException;
use App\Exceptions\AlphaVantage\InvalidSymbolException;
use App\Exceptions\AlphaVantage\NotConfiguredException;
use App\Exceptions\AlphaVantage\RateLimitedException;
use App\Exceptions\AlphaVantage\RequestFailedException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
     * @throws NotConfiguredException|RateLimitedException|InvalidSymbolException|RequestFailedException
     */
    public function getDailyCandles(string $symbol, int $from, int $to): array
    {
        if (! $this->isConfigured()) {
            throw new NotConfiguredException();
        }

        $cacheKey = "av:daily:{$symbol}";
        $cacheTtl = config('alphavantage.cache_ttl.daily_candles', 1800);

        $raw = Cache::remember($cacheKey, $cacheTtl, function () use ($symbol) {
            $response = Http::timeout(20)->get(config('alphavantage.base_url'), [
                'function'   => 'TIME_SERIES_DAILY',
                'symbol'     => strtoupper($symbol),
                'outputsize' => 'compact',
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
            throw new RequestFailedException();
        }

        // AV sends a "Note" when the per-minute or per-day rate limit is hit.
        if (isset($raw['Note']) || isset($raw['Information'])) {
            Log::warning('AlphaVantage rate limit hit', ['symbol' => $symbol]);
            Cache::forget($cacheKey);
            throw new RateLimitedException();
        }

        if (isset($raw['Error Message'])) {
            throw new InvalidSymbolException();
        }

        if (! isset($raw['Time Series (Daily)'])) {
            return ['s' => 'no_data', 't' => [], 'o' => [], 'h' => [], 'l' => [], 'c' => [], 'v' => []];
        }

        return $this->mapTimeSeries($raw['Time Series (Daily)'], $from, $to);
    }

    /**
     * Fetch top gainers, top losers, and most actively traded US tickers.
     *
     * @return array{top_gainers:array, top_losers:array, most_actively_traded:array, last_updated:string}
     * @throws NotConfiguredException|RateLimitedException|InvalidResponseException|RequestFailedException
     */
    public function getTopMovers(): array
    {
        if (! $this->isConfigured()) {
            throw new NotConfiguredException();
        }

        $cacheKey = 'av:top_movers';
        $cacheTtl = (int) config('alphavantage.cache_ttl.movers', 900);

        $raw = Cache::remember($cacheKey, $cacheTtl, function () {
            $response = Http::timeout(20)->get(config('alphavantage.base_url'), [
                'function' => 'TOP_GAINERS_LOSERS',
                'apikey'   => config('alphavantage.key'),
            ]);

            if (! $response->ok()) {
                Log::warning('AlphaVantage TOP_GAINERS_LOSERS HTTP error', ['status' => $response->status()]);
                return null;
            }

            return $response->json();
        });

        if ($raw === null) {
            throw new RequestFailedException();
        }

        if (isset($raw['Note']) || isset($raw['Information'])) {
            Log::warning('AlphaVantage rate limit hit on TOP_GAINERS_LOSERS');
            Cache::forget('av:top_movers');
            throw new RateLimitedException();
        }

        if (! isset($raw['top_gainers'])) {
            throw new InvalidResponseException();
        }

        return [
            'top_gainers'          => $this->normalizeMoverList($raw['top_gainers'] ?? []),
            'top_losers'           => $this->normalizeMoverList($raw['top_losers'] ?? []),
            'most_actively_traded' => $this->normalizeMoverList($raw['most_actively_traded'] ?? []),
            'last_updated'         => $raw['last_updated'] ?? null,
        ];
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    private function normalizeMoverList(array $items): array
    {
        return array_map(function (array $item) {
            $pct = str_replace('%', '', $item['change_percentage'] ?? '0');
            return [
                'symbol'        => $item['ticker']        ?? '',
                'price'         => (float) ($item['price']         ?? 0),
                'change'        => (float) ($item['change_amount'] ?? 0),
                'changePercent' => (float) $pct,
                'volume'        => (int)   ($item['volume']        ?? 0),
            ];
        }, $items);
    }

    private function mapTimeSeries(array $timeSeries, int $from, int $to): array
    {
        $t = $o = $h = $l = $c = $v = [];

        foreach ($timeSeries as $dateStr => $values) {
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
