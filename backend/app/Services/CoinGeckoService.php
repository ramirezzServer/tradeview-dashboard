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
    private const BASE_URL = 'https://api.coingecko.com/api/v3';

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

        return Cache::remember($cacheKey, 30, function () use ($ids, $idToSymbol) {
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

    private function get(string $endpoint, array $params = []): array
    {
        try {
            $response = Http::timeout(10)
                ->acceptJson()
                ->get(self::BASE_URL . $endpoint, $params);

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
