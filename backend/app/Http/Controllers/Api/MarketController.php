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
use Illuminate\Support\Facades\Log;

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
        ['name' => 'Technology', 'symbol' => 'XLK', 'weight' => 28.5],
        ['name' => 'Healthcare', 'symbol' => 'XLV', 'weight' => 13.2],
        ['name' => 'Financials', 'symbol' => 'XLF', 'weight' => 12.8],
        ['name' => 'Consumer Discretionary', 'symbol' => 'XLY', 'weight' => 10.4],
        ['name' => 'Communication Services', 'symbol' => 'XLC', 'weight' => 6.8],
        ['name' => 'Industrials', 'symbol' => 'XLI', 'weight' => 8.9],
        ['name' => 'Consumer Staples', 'symbol' => 'XLP', 'weight' => 5.3],
        ['name' => 'Energy', 'symbol' => 'XLE', 'weight' => 7.6],
        ['name' => 'Utilities', 'symbol' => 'XLU', 'weight' => 4.2],
        ['name' => 'Real Estate', 'symbol' => 'XLRE', 'weight' => 3.8],
        ['name' => 'Materials', 'symbol' => 'XLB', 'weight' => 2.5],
    ];

    private const FALLBACK_MOVERS = [
        'top_gainers' => [
            ['symbol' => 'NVDA', 'price' => 126.42, 'change' => 4.81, 'changePercent' => 3.96, 'volume' => 58200000],
            ['symbol' => 'MSFT', 'price' => 429.18, 'change' => 8.44, 'changePercent' => 2.01, 'volume' => 25100000],
            ['symbol' => 'AAPL', 'price' => 212.63, 'change' => 3.12, 'changePercent' => 1.49, 'volume' => 44100000],
        ],
        'top_losers' => [
            ['symbol' => 'TSLA', 'price' => 178.91, 'change' => -5.22, 'changePercent' => -2.84, 'volume' => 77400000],
            ['symbol' => 'NFLX', 'price' => 612.24, 'change' => -11.66, 'changePercent' => -1.87, 'volume' => 6100000],
            ['symbol' => 'INTC', 'price' => 31.62, 'change' => -0.46, 'changePercent' => -1.43, 'volume' => 38900000],
        ],
        'most_actively_traded' => [
            ['symbol' => 'TSLA', 'price' => 178.91, 'change' => -5.22, 'changePercent' => -2.84, 'volume' => 77400000],
            ['symbol' => 'NVDA', 'price' => 126.42, 'change' => 4.81, 'changePercent' => 3.96, 'volume' => 58200000],
            ['symbol' => 'AAPL', 'price' => 212.63, 'change' => 3.12, 'changePercent' => 1.49, 'volume' => 44100000],
        ],
        'last_updated' => null,
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
            return $this->emptyMovers('Alpha Vantage is not configured.');
        } catch (AvRateLimitedException) {
            return $this->emptyMovers('Alpha Vantage rate limit reached.');
        } catch (AvInvalidResponseException|AvRequestFailedException) {
            return $this->emptyMovers('Could not fetch market movers.');
        } catch (\Throwable) {
            return $this->emptyMovers('Could not fetch market movers.');
        }
    }

    private function emptyMovers(string $reason): JsonResponse
    {
        $data = self::FALLBACK_MOVERS;
        $data['meta'] = [
            'provider' => 'simulated',
            'source' => 'fallback',
            'reason' => $reason,
        ];

        return $this->success($data, 'Market movers fallback data returned.', 200, $data['meta']);
    }

    public function indices(): JsonResponse
    {
        $usedFallback = false;
        $data = array_map(function (array $item) use (&$usedFallback) {
            try {
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
            } catch (\RuntimeException $e) {
                $usedFallback = true;
                return $this->fallbackIndexQuote($item, $e::class);
            }
        }, self::INDEX_ETFS);

        return $this->success($data, 'Market indices fetched successfully.', 200, [
            'provider' => $usedFallback ? 'mixed' : 'finnhub',
            'source' => $usedFallback ? 'partial-fallback' : 'live',
            'count' => count($data),
        ]);
    }

    public function sectors(): JsonResponse
    {
        $usedFallback = false;
        $data = array_map(function (array $item) use (&$usedFallback) {
            try {
                $quote = $this->finnhub->getQuote($item['symbol']);
                $changePercent = (float) ($quote['dp'] ?? 0);

                return [
                    'name' => $item['name'],
                    'symbol' => $item['symbol'],
                    'weight' => $item['weight'],
                    'changePercent' => $changePercent,
                    'change' => (float) ($quote['d'] ?? 0),
                    'price' => (float) ($quote['c'] ?? 0),
                    'status' => $this->sectorStatus($changePercent),
                    'source' => 'finnhub',
                ];
            } catch (\RuntimeException $e) {
                $usedFallback = true;
                return $this->fallbackSectorQuote($item, $e::class);
            }
        }, self::SECTOR_ETFS);

        return $this->success($data, 'Sector performance fetched successfully.', 200, [
            'provider' => $usedFallback ? 'mixed' : 'finnhub',
            'source' => $usedFallback ? 'partial-fallback' : 'live',
            'count' => count($data),
        ]);
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

            if (
                ($data['s'] ?? 'no_data') !== 'ok'
                || count($data['t'] ?? []) < $this->minimumFallbackCandles($request)
            ) {
                return $this->calculatedCandles($symbol, $request, 'alternative provider returned empty or sparse candle data');
            }

            $data = $this->withCandleMeta($data, $symbol, 'alphavantage');
            $count = count($data['t'] ?? []);

            Log::info('Candle fallback result.', [
                'symbol' => $symbol,
                'resolution' => $request->validated('resolution'),
                'from' => (int) $request->validated('from'),
                'to' => (int) $request->validated('to'),
                'provider' => 'alphavantage',
                'count' => $count,
                'reason' => 'alternative provider returned usable candle data',
            ]);

            return $this->success($data, 'Candles fetched from alternative provider.', 200, [
                'symbol'   => $symbol,
                'provider' => 'alphavantage',
                'count'    => $count,
            ]);

        } catch (AvNotConfiguredException) {
            return $this->calculatedCandles($symbol, $request, 'Alpha Vantage is not configured');
        } catch (AvRateLimitedException) {
            return $this->calculatedCandles($symbol, $request, 'Alpha Vantage rate limit reached');
        } catch (AvInvalidSymbolException) {
            return $this->calculatedCandles($symbol, $request, 'Alpha Vantage did not recognise the symbol');
        } catch (AvRequestFailedException) {
            return $this->calculatedCandles($symbol, $request, 'Alpha Vantage request failed');
        } catch (\Throwable) {
            return $this->calculatedCandles($symbol, $request, 'Alpha Vantage fallback failed unexpectedly');
        }
    }

    private function calculatedCandles(string $symbol, CandleRequest $request, string $reason): JsonResponse
    {
        $price = $this->fallbackQuotePrice($symbol);

        $data = app(SimulatedCandleService::class)->generateEquityCandles(
            $symbol,
            $price,
            (int) $request->validated('from'),
            (int) $request->validated('to'),
            $request->validated('resolution'),
        );

        $data = $this->withCandleMeta($data, $symbol, 'calculated');
        $count = count($data['t'] ?? []);

        Log::warning('Candle fallback result.', [
            'symbol' => $symbol,
            'resolution' => $request->validated('resolution'),
            'from' => (int) $request->validated('from'),
            'to' => (int) $request->validated('to'),
            'provider' => 'calculated',
            'count' => $count,
            'reason' => $reason,
        ]);

        return $this->success($data, 'Candles calculated from fallback data.', 200, [
            'symbol' => $symbol,
            'provider' => 'calculated',
            'count' => $count,
        ])->header('X-Data-Source', 'calculated');
    }

    private function withCandleMeta(array $data, string $symbol, string $provider): array
    {
        $data['s'] = 'ok';
        $data['meta'] = [
            'symbol' => $symbol,
            'provider' => $provider,
            'count' => count($data['t'] ?? []),
        ];

        return $data;
    }

    private function fallbackQuotePrice(string $symbol): float
    {
        try {
            $quote = $this->finnhub->getQuote($symbol);
            $price = (float) ($quote['c'] ?? $quote['pc'] ?? 0);

            if ($price > 0) {
                return $price;
            }
        } catch (\RuntimeException $e) {
            Log::warning('Could not fetch quote for candle fallback; using deterministic estimate.', [
                'symbol' => $symbol,
                'exception' => $e::class,
            ]);
        }

        $hash = hexdec(substr(hash('crc32b', $symbol), 0, 6));

        return round(50 + ($hash % 45000) / 100, 2);
    }

    private function minimumFallbackCandles(CandleRequest $request): int
    {
        $resolution = $request->validated('resolution');

        if ($resolution === '60') {
            $rangeDays = max(1, (int) ceil(((int) $request->validated('to') - (int) $request->validated('from')) / 86400));

            return $rangeDays >= 7 ? 48 : 24;
        }

        $rangeDays = max(1, (int) ceil(((int) $request->validated('to') - (int) $request->validated('from')) / 86400));

        return $rangeDays >= 60 ? 60 : 30;
    }

    private function fallbackIndexQuote(array $item, string $reason): array
    {
        $seed = $this->deterministicMarketSeed($item['symbol']);
        $price = round(80 + $seed * 420, 2);
        $changePercent = round(($seed - 0.48) * 3.2, 2);
        $change = round($price * $changePercent / 100, 2);

        return [
            'name' => $item['name'],
            'symbol' => $item['symbol'],
            'price' => $price,
            'change' => $change,
            'changePercent' => $changePercent,
            'previousClose' => round($price - $change, 2),
            'source' => 'simulated',
            'reason' => $reason,
        ];
    }

    private function fallbackSectorQuote(array $item, string $reason): array
    {
        $seed = $this->deterministicMarketSeed($item['symbol']);
        $price = round(35 + $seed * 180, 2);
        $changePercent = round(($seed - 0.50) * 3.0, 2);
        $change = round($price * $changePercent / 100, 2);

        return [
            'name' => $item['name'],
            'symbol' => $item['symbol'],
            'weight' => $item['weight'],
            'changePercent' => $changePercent,
            'change' => $change,
            'price' => $price,
            'status' => $this->sectorStatus($changePercent),
            'source' => 'simulated',
            'reason' => $reason,
        ];
    }

    private function deterministicMarketSeed(string $symbol): float
    {
        return hexdec(substr(hash('sha256', $symbol), 0, 8)) / 0xffffffff;
    }

    private function sectorStatus(float $changePercent): string
    {
        if ($changePercent > 0.05) return 'advancing';
        if ($changePercent < -0.05) return 'declining';
        return 'neutral';
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
