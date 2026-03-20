<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CandleRequest;
use App\Http\Requests\MarketNewsRequest;
use App\Http\Traits\ApiResponse;
use App\Services\FinnhubService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class MarketController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly FinnhubService $finnhub) {}

    /**
     * GET /api/market/quote/{symbol}
     */
    public function quote(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getQuote($symbol);

            // Finnhub returns c=0 for unknown symbols
            if (($data['c'] ?? 0) == 0 && ($data['t'] ?? 0) == 0) {
                return $this->error("Symbol '{$symbol}' not found or has no data.", 404);
            }

            return $this->success($data, 'Quote fetched successfully.', 200, [
                'symbol' => $symbol,
            ]);

        } catch (RuntimeException $e) {
            return $this->handleFinnhubException($e);
        }
    }

    /**
     * GET /api/market/candles/{symbol}?resolution=D&from=1234567890&to=1234567890
     */
    public function candles(CandleRequest $request, string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getCandles(
                $symbol,
                $request->validated('resolution'),
                (int) $request->validated('from'),
                (int) $request->validated('to'),
            );

            return $this->success($data, 'Candles fetched successfully.', 200, [
                'symbol'     => $symbol,
                'resolution' => $request->validated('resolution'),
                'count'      => count($data['t'] ?? []),
            ]);

        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'CANDLE_NO_DATA') {
                return $this->error('No candle data available for the given range.', 404);
            }

            return $this->handleFinnhubException($e);
        }
    }

    /**
     * GET /api/market/news?category=general&minId=0
     */
    public function news(MarketNewsRequest $request): JsonResponse
    {
        try {
            $category = $request->validated('category') ?? 'general';
            $minId    = (int) ($request->validated('minId') ?? 0);

            $data = $this->finnhub->getMarketNews($category, $minId);

            return $this->success($data, 'News fetched successfully.', 200, [
                'category' => $category,
                'count'    => count($data),
            ]);

        } catch (RuntimeException $e) {
            return $this->handleFinnhubException($e);
        }
    }

    /**
     * GET /api/market/profile/{symbol}
     */
    public function profile(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getProfile($symbol);

            return $this->success($data, 'Company profile fetched successfully.');

        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'PROFILE_NOT_FOUND') {
                return $this->error("No profile found for symbol '{$symbol}'.", 404);
            }

            return $this->handleFinnhubException($e);
        }
    }

    /**
     * GET /api/market/financials/{symbol}
     */
    public function financials(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getFinancials($symbol);

            return $this->success($data, 'Financials fetched successfully.');

        } catch (RuntimeException $e) {
            return $this->handleFinnhubException($e);
        }
    }

    // ─── Error Handling ───────────────────────────────────────────────────────

    private function handleFinnhubException(RuntimeException $e): JsonResponse
    {
        $code = $e->getMessage();

        // Handle HTTP_* codes generically (e.g. HTTP_500, HTTP_503)
        if (str_starts_with($code, 'HTTP_')) {
            return $this->error('Finnhub returned an unexpected error. Please try again.', 502);
        }

        return match ($code) {
            // 429 — Finnhub rate limit
            'RATE_LIMITED' => $this->error(
                'Finnhub rate limit reached. Please wait a moment and try again.',
                429
            ),

            // 401 — API key is wrong or expired
            'UNAUTHORIZED' => $this->error(
                'The Finnhub API key is invalid or expired. Check FINNHUB_API_KEY in .env.',
                503
            ),

            // 403 — Key is valid but this endpoint/data requires a higher plan
            'ACCESS_FORBIDDEN' => $this->error(
                'Your Finnhub plan does not include access to this data. A paid plan may be required.',
                403
            ),

            // Key is missing from .env entirely
            'FINNHUB_API_KEY_MISSING' => $this->error(
                'Finnhub API key is not configured on the server.',
                503
            ),

            // Connection failure, SSL error, or timeout
            'FINNHUB_REQUEST_FAILED' => $this->error(
                'Could not connect to Finnhub. Check server logs for the exception class and message.',
                503
            ),

            // Finnhub returned non-JSON or empty body
            'INVALID_RESPONSE' => $this->error(
                'Finnhub returned an unexpected response format.',
                502
            ),

            default => $this->error('An unexpected error occurred.', 500),
        };
    }
}
