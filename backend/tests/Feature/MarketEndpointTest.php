<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MarketEndpointTest extends TestCase
{
    private string $finnhubBase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        config(['finnhub.api_key' => 'test-key']);
        $this->finnhubBase = config('finnhub.base_url', 'https://finnhub.io/api/v1');
    }

    // ─── Quote ───────────────────────────────────────────────────────────────

    public function test_quote_returns_success(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([
                'c' => 150.0, 'h' => 155.0, 'l' => 148.0,
                'o' => 149.0, 'pc' => 148.0, 't' => 1700000000,
            ], 200),
        ]);

        $this->getJson('/api/market/quote/AAPL')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.c', 150);
    }

    public function test_quote_returns_404_for_unknown_symbol(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response(['c' => 0, 't' => 0], 200),
        ]);

        $this->getJson('/api/market/quote/FAKE')->assertStatus(404);
    }

    public function test_quote_returns_422_for_invalid_symbol_format(): void
    {
        $this->getJson('/api/market/quote/THIS_IS_WAY_TOO_LONG_TO_BE_A_VALID_TICKER')
            ->assertStatus(422);
    }

    public function test_quote_returns_429_when_rate_limited(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([], 429),
        ]);

        $this->getJson('/api/market/quote/AAPL')->assertStatus(429);
    }

    public function test_quote_returns_403_when_access_forbidden(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([], 403),
        ]);

        $this->getJson('/api/market/quote/AAPL')->assertStatus(403);
    }

    public function test_quote_returns_503_when_api_key_missing(): void
    {
        config(['finnhub.api_key' => '']);

        $this->getJson('/api/market/quote/AAPL')->assertStatus(503);
    }

    public function test_batch_quotes_returns_per_symbol_results(): void
    {
        Http::fake([
            "{$this->finnhubBase}/quote?*" => function ($request) {
                parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);
                $symbol = $query['symbol'] ?? '';

                return match ($symbol) {
                    'AAPL' => Http::response(['c' => 150.0, 'd' => 1.2, 'dp' => 0.8, 'h' => 151.0, 'l' => 148.0, 'o' => 149.0, 'pc' => 148.8, 't' => 1700000000], 200),
                    'MSFT' => Http::response(['c' => 0, 't' => 0], 200),
                    default => Http::response([], 500),
                };
            },
        ]);

        $this->getJson('/api/market/quotes?symbols=AAPL,MSFT')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.AAPL.success', true)
            ->assertJsonPath('data.AAPL.quote.c', 150)
            ->assertJsonPath('data.MSFT.success', false);
    }

    // ─── Candles ─────────────────────────────────────────────────────────────

    public function test_candles_returns_success(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([
                's' => 'ok',
                't' => [1700000000],
                'o' => [100.0], 'h' => [110.0], 'l' => [90.0], 'c' => [105.0], 'v' => [1000],
            ], 200),
        ]);

        $from = now()->subDays(30)->timestamp;
        $to   = now()->timestamp;

        $this->getJson("/api/market/candles/AAPL?resolution=D&from={$from}&to={$to}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_candles_returns_404_when_no_data(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response(['s' => 'no_data'], 200),
        ]);

        $from = now()->subDays(30)->timestamp;
        $to   = now()->timestamp;

        $this->getJson("/api/market/candles/AAPL?resolution=D&from={$from}&to={$to}")
            ->assertStatus(404);
    }

    public function test_alternative_candles_accepts_primary_candle_params(): void
    {
        config([
            'alphavantage.key' => 'test-key',
            'alphavantage.base_url' => 'https://www.alphavantage.co/query',
        ]);

        Http::fake([
            'https://www.alphavantage.co/query*' => Http::response([
                'Time Series (Daily)' => [
                    now()->subDay()->toDateString() => [
                        '1. open' => '100.00',
                        '2. high' => '110.00',
                        '3. low' => '90.00',
                        '4. close' => '105.00',
                        '5. volume' => '1000',
                    ],
                ],
            ], 200),
            "{$this->finnhubBase}/*" => Http::response([
                'c' => 150.0, 'pc' => 149.0, 't' => 1700000000,
            ], 200),
        ]);

        $from = now()->subDays(30)->timestamp;
        $to = now()->timestamp;

        $this->getJson("/api/market/candles-alt/AAPL?resolution=D&from={$from}&to={$to}")
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.s', 'ok');
    }

    public function test_alternative_candles_returns_calculated_data_when_provider_fails(): void
    {
        config([
            'alphavantage.key' => 'test-key',
            'alphavantage.base_url' => 'https://www.alphavantage.co/query',
        ]);

        Http::fake([
            'https://www.alphavantage.co/query*' => Http::response([], 500),
            "{$this->finnhubBase}/*" => Http::response([
                'c' => 150.0, 'pc' => 149.0, 't' => 1700000000,
            ], 200),
        ]);

        $to = now()->timestamp;
        $from = $to - (7 * 86400);

        $this->getJson("/api/market/candles-alt/AAPL?resolution=60&from={$from}&to={$to}")
            ->assertStatus(200)
            ->assertHeader('X-Data-Source', 'calculated')
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.s', 'ok')
            ->assertJsonCount(168, 'data.t');
    }

    public function test_market_movers_returns_fallback_response_when_provider_unavailable(): void
    {
        config(['alphavantage.key' => '']);

        $this->getJson('/api/market/movers')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.provider', 'simulated')
            ->assertJsonCount(3, 'data.top_gainers')
            ->assertJsonCount(3, 'data.top_losers')
            ->assertJsonCount(3, 'data.most_actively_traded');
    }

    // ─── News ─────────────────────────────────────────────────────────────────

    public function test_news_returns_success(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([
                ['category' => 'general', 'headline' => 'Test news', 'id' => 1],
            ], 200),
        ]);

        $this->getJson('/api/market/news?category=general&minId=0')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    // ─── Profile ─────────────────────────────────────────────────────────────

    public function test_profile_returns_success(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([
                'ticker' => 'AAPL', 'name' => 'Apple Inc', 'country' => 'US',
            ], 200),
        ]);

        $this->getJson('/api/market/profile/AAPL')
            ->assertStatus(200)
            ->assertJsonPath('data.ticker', 'AAPL');
    }

    public function test_profile_returns_404_for_unknown_symbol(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([], 200),
        ]);

        $this->getJson('/api/market/profile/FAKE')->assertStatus(404);
    }

    // ─── Financials ──────────────────────────────────────────────────────────

    public function test_financials_returns_success(): void
    {
        Http::fake([
            "{$this->finnhubBase}/*" => Http::response([
                'metric' => ['52WeekHigh' => 200.0, '52WeekLow' => 120.0],
            ], 200),
        ]);

        $this->getJson('/api/market/financials/AAPL')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
