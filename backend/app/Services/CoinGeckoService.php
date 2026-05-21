<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Proxy for CoinGecko public API (no key required).
 *
 * Used for crypto spot prices that Finnhub free plan cannot provide.
 * Returns quotes normalized to the same shape used by FinnhubService:
 *   c  => current price
 *   d  => 24-hour dollar change
 *   dp => 24-hour percent change
 */
class CoinGeckoService
{
    /**
     * Maps uppercase ticker symbols to CoinGecko coin IDs.
     * Extend as needed — only symbols in this map can be queried.
     */
    private const SYMBOL_MAP = [
        'BTC'   => 'bitcoin',
        'ETH'   => 'ethereum',
        'SOL'   => 'solana',
        'BNB'   => 'binancecoin',
        'XRP'   => 'ripple',
        'ADA'   => 'cardano',
        'DOGE'  => 'dogecoin',
        'DOT'   => 'polkadot',
        'AVAX'  => 'avalanche-2',
        'LINK'  => 'chainlink',
        'LTC'   => 'litecoin',
        'MATIC' => 'matic-network',
        'SHIB'  => 'shiba-inu',
        'UNI'   => 'uniswap',
    ];

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Fetch spot prices for one or more crypto symbols.
     *
     * @param  string[]  $symbols  Uppercase ticker symbols, e.g. ['BTC', 'ETH']
     * @return array<string, array{c:float,d:float,dp:float,market_cap:float,source:string}>
     *         Keyed by uppercase symbol.
     * @throws RuntimeException on network/API failure
     */
    public function getPrices(array $symbols): array
    {
        [$ids, $idToSymbol] = $this->mapSymbolsToIds($symbols);

        if (empty($ids)) {
            return [];
        }

        $cacheKey = 'coingecko.prices.' . implode(',', $ids);
        $cacheTtl = (int) config('coingecko.cache_ttl', 30);

        return Cache::remember($cacheKey, $cacheTtl, function () use ($ids, $idToSymbol) {
            $response = $this->get('/simple/price', [
                'ids'                 => implode(',', $ids),
                'vs_currencies'       => 'usd',
                'include_24hr_change' => 'true',
                'include_market_cap'  => 'true',
            ]);

            $result = [];
            foreach ($response as $id => $data) {
                $sym = $idToSymbol[$id] ?? null;
                if ($sym === null) continue;

                $price     = (float) ($data['usd']             ?? 0);
                $changePct = (float) ($data['usd_24h_change']  ?? 0);
                $marketCap = (float) ($data['usd_market_cap']  ?? 0);

                $result[$sym] = [
                    'c'          => round($price,                    8),
                    'd'          => round($price * $changePct / 100, 8),
                    'dp'         => round($changePct,                4),
                    'market_cap' => $marketCap,
                    'source'     => 'coingecko',
                ];
            }

            return $result;
        });
    }

    /**
     * @return array{data:array{s:string,t:int[],o:float[],h:float[],l:float[],c:float[],v:int[]},source:string}
     */
    public function getOhlcv(string $symbol, int $from, int $to, string $resolution): array
    {
        $symbol = strtoupper(trim($symbol));
        $id = self::SYMBOL_MAP[$symbol] ?? null;

        if ($id === null) {
            return [
                'data' => ['s' => 'no_data', 't' => [], 'o' => [], 'h' => [], 'l' => [], 'c' => [], 'v' => []],
                'source' => 'unavailable',
            ];
        }

        $current = $this->getPrices([$symbol])[$symbol]['c'] ?? 0;
        $days = max(1, min(90, (int) ceil(($to - $from) / 86400)));
        $simulator = app(SimulatedCandleService::class);

        try {
            $raw = $this->get("/coins/{$id}/ohlc", [
                'vs_currency' => 'usd',
                'days' => $days <= 1 ? 1 : ($days <= 7 ? 7 : ($days <= 31 ? 30 : 90)),
            ]);

            $mapped = $this->mapOhlc($raw, $from, $to, $symbol);
            if (($mapped['s'] ?? 'no_data') === 'ok' && ! empty($mapped['t'])) {
                return ['data' => $mapped, 'source' => 'coingecko'];
            }
        } catch (RuntimeException) {
            // Paid-plan failures, quota errors, and empty responses all fall back below.
        }

        return [
            'data' => $simulator->generateCryptoCandles($symbol, (float) $current, $from, $to, $resolution),
            'source' => 'simulated',
        ];
    }

    /**
     * Returns the list of supported uppercase symbols.
     *
     * @return string[]
     */
    public static function supportedSymbols(): array
    {
        return array_keys(self::SYMBOL_MAP);
    }

    /**
     * Returns true when the given uppercase symbol is supported.
     */
    public static function isSupported(string $symbol): bool
    {
        return array_key_exists(strtoupper($symbol), self::SYMBOL_MAP);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /**
     * @return array{0: string[], 1: array<string,string>}  [ids[], idToSymbol[]]
     */
    private function mapSymbolsToIds(array $symbols): array
    {
        $ids        = [];
        $idToSymbol = [];

        foreach ($symbols as $sym) {
            $sym = strtoupper(trim($sym));
            $id  = self::SYMBOL_MAP[$sym] ?? null;
            if ($id !== null) {
                $ids[]          = $id;
                $idToSymbol[$id] = $sym;
            }
        }

        return [$ids, $idToSymbol];
    }

    /**
     * CoinGecko OHLC does not include volume, so volume is realistically simulated
     * while preserving real open/high/low/close values when available.
     *
     * @return array{s:string,t:int[],o:float[],h:float[],l:float[],c:float[],v:int[]}
     */
    private function mapOhlc(array $rows, int $from, int $to, string $symbol): array
    {
        $t = $o = $h = $l = $c = $v = [];
        [$minVolume, $maxVolume] = match ($symbol) {
            'BTC' => [20000, 50000],
            'ETH' => [10000, 30000],
            default => [1000, 10000],
        };

        foreach ($rows as $i => $row) {
            if (! is_array($row) || count($row) < 5) continue;
            $ts = (int) floor(((int) $row[0]) / 1000);
            if ($ts < $from || $ts > $to) continue;

            $t[] = $ts;
            $o[] = (float) $row[1];
            $h[] = (float) $row[2];
            $l[] = (float) $row[3];
            $c[] = (float) $row[4];
            $seed = hexdec(substr(hash('sha256', "{$symbol}:{$ts}:volume"), 0, 8)) / 0xffffffff;
            $v[] = (int) round($minVolume + $seed * ($maxVolume - $minVolume));
        }

        if (empty($t)) {
            return ['s' => 'no_data', 't' => [], 'o' => [], 'h' => [], 'l' => [], 'c' => [], 'v' => []];
        }

        array_multisort($t, SORT_ASC, $o, $h, $l, $c, $v);

        return ['s' => 'ok', 't' => $t, 'o' => $o, 'h' => $h, 'l' => $l, 'c' => $c, 'v' => $v];
    }

    private function get(string $endpoint, array $params = []): array
    {
        try {
            $response = Http::timeout(10)
                ->acceptJson()
                ->get(rtrim((string) config('coingecko.base_url'), '/') . $endpoint, $params);

            if ($response->status() === 429) {
                Log::warning('CoinGecko rate limit', ['endpoint' => $endpoint]);
                throw new RuntimeException('RATE_LIMITED');
            }

            if ($response->failed()) {
                Log::error('CoinGecko HTTP error', [
                    'endpoint' => $endpoint,
                    'status'   => $response->status(),
                ]);
                throw new RuntimeException('HTTP_' . $response->status());
            }

            $data = $response->json();

            if ($data === null) {
                throw new RuntimeException('INVALID_RESPONSE');
            }

            return $data;

        } catch (RuntimeException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('CoinGecko unexpected error', [
                'endpoint' => $endpoint,
                'class'    => get_class($e),
                'message'  => $e->getMessage(),
            ]);
            throw new RuntimeException('COINGECKO_REQUEST_FAILED');
        }
    }
}
