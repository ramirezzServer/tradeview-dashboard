<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\CoinGeckoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class CryptoController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly CoinGeckoService $coinGecko) {}

    /**
     * GET /api/market/crypto/prices?symbols=BTC,ETH,SOL
     *
     * Returns spot prices for the requested crypto symbols via CoinGecko.
     * Response shape per symbol:
     *   c          => current price (USD)
     *   d          => 24h dollar change
     *   dp         => 24h percent change
     *   market_cap => market cap (USD)
     *   source     => "coingecko"
     */
    public function prices(Request $request): JsonResponse
    {
        $raw = $request->query('symbols', 'BTC,ETH,SOL');

        // Sanitize: accept only uppercase alphanum, max 15 chars each
        $symbols = array_values(array_filter(
            array_map(
                fn ($s) => strtoupper(trim($s)),
                explode(',', (string) $raw)
            ),
            fn ($s) => preg_match('/^[A-Z0-9]{1,15}$/', $s)
        ));

        if (empty($symbols)) {
            return $this->error('No valid symbols provided.', 422);
        }

        try {
            $prices = $this->coinGecko->getPrices($symbols);

            return $this->success($prices, 'Crypto prices fetched.', 200, [
                'count'     => count($prices),
                'source'    => 'coingecko',
                'requested' => $symbols,
            ]);

        } catch (RuntimeException $e) {
            return match ($e->getMessage()) {
                'RATE_LIMITED'            => $this->error('CoinGecko rate limit reached. Please wait.', 429),
                'COINGECKO_REQUEST_FAILED' => $this->error('Could not connect to CoinGecko.', 503),
                default                   => $this->error('Could not fetch crypto prices.', 503),
            };
        }
    }

    /**
     * GET /api/market/crypto/supported
     *
     * Returns the list of crypto symbols this backend can quote.
     */
    public function supported(): JsonResponse
    {
        return $this->success(
            CoinGeckoService::supportedSymbols(),
            'Supported crypto symbols.'
        );
    }
}
