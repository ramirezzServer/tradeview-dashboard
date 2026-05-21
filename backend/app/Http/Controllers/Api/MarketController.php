<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AlphaVantage\InvalidSymbolException as AvInvalidSymbolException;
use App\Exceptions\AlphaVantage\NotConfiguredException as AvNotConfiguredException;
use App\Exceptions\AlphaVantage\RateLimitedException as AvRateLimitedException;
use App\Exceptions\AlphaVantage\RequestFailedException as AvRequestFailedException;
use App\Exceptions\AlphaVantage\InvalidResponseException as AvInvalidResponseException;
use App\Exceptions\Finnhub\CandleNoDataException;
use App\Exceptions\Finnhub\ForbiddenException as FinnhubForbiddenException;
use App\Exceptions\Finnhub\ProfileNotFoundException;
use App\Exceptions\Finnhub\RateLimitedException as FinnhubRateLimitedException;
use App\Exceptions\Finnhub\UnauthorizedException as FinnhubUnauthorizedException;
use App\Exceptions\Finnhub\ApiKeyMissingException;
use App\Exceptions\Finnhub\RequestFailedException as FinnhubRequestFailedException;
use App\Exceptions\Finnhub\InvalidResponseException as FinnhubInvalidResponseException;
use App\Exceptions\Finnhub\HttpException as FinnhubHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CandleRequest;
use App\Http\Requests\CompanyNewsRequest;
use App\Http\Requests\MarketNewsRequest;
use App\Http\Traits\ApiResponse;
use App\Services\AlphaVantageService;
use App\Services\FinnhubService;
use App\Services\SimulatedCandleService;
use Illuminate\Http\JsonResponse;

class MarketController extends Controller
{
    use ApiResponse;

    private const INDEX_ETFS = [
        ['name' => 'S&P 500', 'symbol' => 'SPY'],
        ['name' => 'NASDAQ', 'symbol' => 'QQQ'],
        ['name' => 'DOW', 'symbol' => 'DIA'],
        ['name' => 'Russell 2000', 'symbol' => 'IWM'],
        ['name' => 'VIX', 'symbol' => 'UVXY'],
    ];

    private const SECTOR_ETFS = [
        ['name' => 'Technology', 'symbol' => 'XLK'],
        ['name' => 'Healthcare', 'symbol' => 'XLV'],
        ['name' => 'Financials', 'symbol' => 'XLF'],
        ['name' => 'Energy', 'symbol' => 'XLE'],
        ['name' => 'Consumer Discretionary', 'symbol' => 'XLY'],
        ['name' => 'Consumer Staples', 'symbol' => 'XLP'],
        ['name' => 'Industrials', 'symbol' => 'XLI'],
        ['name' => 'Materials', 'symbol' => 'XLB'],
        ['name' => 'Utilities', 'symbol' => 'XLU'],
        ['name' => 'Real Estate', 'symbol' => 'XLRE'],
        ['name' => 'Communication Services', 'symbol' => 'XLC'],
    ];

    public function __construct(private readonly FinnhubService $finnhub) {}

    public function quote(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getQuote($symbol);

            if (($data['c'] ?? 0) == 0 && ($data['t'] ?? 0) == 0) {
                return $this->error("Symbol '{$symbol}' not found or has no data.", 404);
            }

            return $this->success($data, 'Quote fetched successfully.', 200, ['symbol' => $symbol]);

        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

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

        } catch (CandleNoDataException) {
            return $this->error('No candle data available for the given range.', 404);
        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

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

        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function profile(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getProfile($symbol);

            return $this->success($data, 'Company profile fetched successfully.');

        } catch (ProfileNotFoundException) {
            return $this->error("No profile found for symbol '{$symbol}'.", 404);
        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function financials(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getFinancials($symbol);

            return $this->success($data, 'Financials fetched successfully.');

        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function companyNews(CompanyNewsRequest $request, string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getCompanyNews(
                $symbol,
                $request->validated('from'),
                $request->validated('to'),
            );

            return $this->success($data, 'Company news fetched successfully.', 200, [
                'symbol' => $symbol,
                'count'  => count($data),
            ]);

        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function movers(): JsonResponse
    {
        $av = new AlphaVantageService();

        try {
            $data = $av->getTopMovers();

            return $this->success($data, 'Market movers fetched successfully.', 200, [
                'provider' => 'alphavantage',
            ]);

        } catch (AvNotConfiguredException) {
            return $this->error(
                'Market movers provider (Alpha Vantage) is not configured. Set ALPHA_VANTAGE_KEY in .env.',
                503
            );
        } catch (AvRateLimitedException) {
            return $this->error(
                'Alpha Vantage rate limit reached. Market movers will be available again soon.',
                429
            );
        } catch (AvInvalidResponseException|AvRequestFailedException) {
            return $this->error('Could not fetch market movers.', 503);
        }
    }

    public function indices(): JsonResponse
    {
        try {
            $data = array_map(function (array $item) {
                $quote = $this->finnhub->getQuote($item['symbol']);

                return [
                    'name' => $item['name'],
                    'symbol' => $item['symbol'],
                    'price' => (float) ($quote['c'] ?? 0),
                    'change' => (float) ($quote['d'] ?? 0),
                    'changePercent' => (float) ($quote['dp'] ?? 0),
                    'previousClose' => (float) ($quote['pc'] ?? 0),
                    'source' => 'finnhub',
                ];
            }, self::INDEX_ETFS);

            return $this->success($data, 'Market indices fetched successfully.', 200, [
                'provider' => 'finnhub',
                'count' => count($data),
            ]);
        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function sectors(): JsonResponse
    {
        try {
            $data = array_map(function (array $item) {
                $quote = $this->finnhub->getQuote($item['symbol']);

                return [
                    'name' => $item['name'],
                    'symbol' => $item['symbol'],
                    'changePercent' => (float) ($quote['dp'] ?? 0),
                    'change' => (float) ($quote['d'] ?? 0),
                    'price' => (float) ($quote['c'] ?? 0),
                    'source' => 'finnhub',
                ];
            }, self::SECTOR_ETFS);

            return $this->success($data, 'Sector performance fetched successfully.', 200, [
                'provider' => 'finnhub',
                'count' => count($data),
            ]);
        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function earnings(string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        try {
            $data = $this->finnhub->getEarnings($symbol);

            return $this->success($data, 'Earnings fetched successfully.', 200, [
                'symbol' => $symbol,
                'count'  => count($data),
            ]);

        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    public function alternativeCandles(CandleRequest $request, string $symbol): JsonResponse
    {
        $symbol = strtoupper(trim($symbol));

        if (! preg_match('/^[A-Z0-9.:\-]{1,20}$/', $symbol)) {
            return $this->error('Invalid symbol format.', 422);
        }

        $av = new AlphaVantageService();

        try {
            $data = $av->getDailyCandles(
                $symbol,
                (int) $request->validated('from'),
                (int) $request->validated('to'),
            );

            if (($data['s'] ?? 'no_data') !== 'ok') {
                return $this->error('No candle data available from alternative provider.', 404);
            }

            return $this->success($data, 'Candles fetched from alternative provider.', 200, [
                'symbol'   => $symbol,
                'provider' => 'alphavantage',
                'count'    => count($data['t'] ?? []),
            ]);

        } catch (AvNotConfiguredException) {
            return $this->calculatedCandles($symbol, $request);
        } catch (AvRateLimitedException) {
            return $this->calculatedCandles($symbol, $request);
        } catch (AvInvalidSymbolException) {
            return $this->error(
                "Symbol '{$symbol}' was not recognised by the alternative provider.",
                404
            );
        } catch (AvRequestFailedException) {
            return $this->error('Alternative candle provider request failed.', 503);
        }
    }

    private function calculatedCandles(string $symbol, CandleRequest $request): JsonResponse
    {
        try {
            $quote = $this->finnhub->getQuote($symbol);
            $price = (float) ($quote['c'] ?? $quote['pc'] ?? 0);

            if ($price <= 0) {
                return $this->error('Could not calculate candle fallback without a current quote.', 503);
            }

            $data = app(SimulatedCandleService::class)->generateEquityCandles(
                $symbol,
                $price,
                (int) $request->validated('from'),
                (int) $request->validated('to'),
                $request->validated('resolution'),
            );

            return $this->success($data, 'Candles calculated from live quote fallback.', 200, [
                'symbol' => $symbol,
                'provider' => 'calculated',
                'count' => count($data['t'] ?? []),
            ])->header('X-Data-Source', 'calculated');
        } catch (\RuntimeException $e) {
            return $this->finnhubError($e);
        }
    }

    // ─── Error Handling ───────────────────────────────────────────────────────

    private function finnhubError(\RuntimeException $e): JsonResponse
    {
        return match (true) {
            $e instanceof FinnhubRateLimitedException    => $this->error('Finnhub rate limit reached. Please wait a moment and try again.', 429),
            $e instanceof FinnhubUnauthorizedException   => $this->error('The Finnhub API key is invalid or expired. Check FINNHUB_API_KEY in .env.', 503),
            $e instanceof FinnhubForbiddenException      => $this->error('Your Finnhub plan does not include access to this data. A paid plan may be required.', 403),
            $e instanceof ApiKeyMissingException         => $this->error('Finnhub API key is not configured on the server.', 503),
            $e instanceof FinnhubRequestFailedException  => $this->error('Could not connect to Finnhub. Check server logs for the exception class and message.', 503),
            $e instanceof FinnhubInvalidResponseException => $this->error('Finnhub returned an unexpected response format.', 502),
            $e instanceof FinnhubHttpException           => $this->error('Finnhub returned an unexpected error. Please try again.', 502),
            default                                      => $this->error('An unexpected error occurred.', 500),
        };
    }
}
