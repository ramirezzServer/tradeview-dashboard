<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MarketEndpointTest extends TestCase
{
    private string $finnhubBase;

    protected function setUp(): void
    {
        parent::setUp();
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
