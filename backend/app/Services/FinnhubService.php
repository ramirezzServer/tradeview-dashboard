<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class FinnhubService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('finnhub.api_key');
        $this->baseUrl = config('finnhub.base_url');
    }

    // ─── Public API Methods ───────────────────────────────────────────────────

    /**
     * GET /quote?symbol={symbol}
     */
    public function getQuote(string $symbol): array
    {
        $ttl = config('finnhub.cache.quote');
        $key = "finnhub.quote.{$symbol}";

        return Cache::remember($key, $ttl, fn () => $this->get('/quote', ['symbol' => $symbol]));
    }

    /**
     * GET /stock/candle?symbol={symbol}&resolution={resolution}&from={from}&to={to}
     */
    public function getCandles(string $symbol, string $resolution, int $from, int $to): array
    {
        $ttl = config('finnhub.cache.candles');
        $key = "finnhub.candles.{$symbol}.{$resolution}.{$from}.{$to}";

        $data = Cache::remember($key, $ttl, fn () => $this->get('/stock/candle', [
            'symbol'     => $symbol,
            'resolution' => $resolution,
            'from'       => $from,
            'to'         => $to,
        ]));

        if (($data['s'] ?? null) !== 'ok') {
            throw new RuntimeException('CANDLE_NO_DATA');
        }

        return $data;
    }

    /**
     * GET /news?category={category}&minId={minId}
     */
    public function getMarketNews(string $category = 'general', int $minId = 0): array
    {
        $ttl = config('finnhub.cache.news');
        $key = "finnhub.news.{$category}.{$minId}";

        return Cache::remember($key, $ttl, fn () => $this->get('/news', [
            'category' => $category,
            'minId'    => $minId,
        ]));
    }

    /**
     * GET /company-news?symbol={symbol}&from={from}&to={to}
     */
    public function getCompanyNews(string $symbol, string $from, string $to): array
    {
        $ttl = config('finnhub.cache.news');
        $key = "finnhub.company_news.{$symbol}.{$from}.{$to}";

        return Cache::remember($key, $ttl, fn () => $this->get('/company-news', [
            'symbol' => $symbol,
            'from'   => $from,
            'to'     => $to,
        ]));
    }

    /**
     * GET /stock/profile2?symbol={symbol}
     */
    public function getProfile(string $symbol): array
    {
        $ttl = config('finnhub.cache.profile');
        $key = "finnhub.profile.{$symbol}";

        $data = Cache::remember($key, $ttl, fn () => $this->get('/stock/profile2', ['symbol' => $symbol]));

        if (empty($data) || ! isset($data['ticker'])) {
            throw new RuntimeException('PROFILE_NOT_FOUND');
        }

        return $data;
    }

    /**
     * GET /stock/metric?symbol={symbol}&metric=all
     */
    public function getFinancials(string $symbol): array
    {
        $ttl = config('finnhub.cache.financials');
        $key = "finnhub.financials.{$symbol}";

        return Cache::remember($key, $ttl, fn () => $this->get('/stock/metric', [
            'symbol' => $symbol,
            'metric' => 'all',
        ]));
    }

    // ─── Internal HTTP ────────────────────────────────────────────────────────

    private function get(string $endpoint, array $params = []): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('FINNHUB_API_KEY_MISSING');
        }

        $params['token'] = $this->apiKey;

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->get($this->baseUrl . $endpoint, $params);

            $status = $response->status();

            // 429 — Finnhub rate limit
            if ($status === 429) {
                Log::warning('Finnhub rate limit hit', ['endpoint' => $endpoint]);
                throw new RuntimeException('RATE_LIMITED');
            }

            // 401 — API key rejected (invalid or expired)
            if ($status === 401) {
                Log::error('Finnhub returned 401 — API key invalid', ['endpoint' => $endpoint]);
                throw new RuntimeException('UNAUTHORIZED');
            }

            // 403 — Access denied for this endpoint (plan restriction, IP block, etc.)
            // This is intentionally separate from 401: the key IS valid but lacks access.
            if ($status === 403) {
                Log::warning('Finnhub returned 403 — access forbidden', [
                    'endpoint' => $endpoint,
                    'body'     => $response->body(),
                ]);
                throw new RuntimeException('ACCESS_FORBIDDEN');
            }

            // Any other non-2xx response
            if ($response->failed()) {
                Log::error('Finnhub HTTP error', [
                    'endpoint' => $endpoint,
                    'status'   => $status,
                    'body'     => substr($response->body(), 0, 500),
                ]);
                throw new RuntimeException("HTTP_{$status}");
            }

            // Parse JSON — returns null if response body is not valid JSON
            $data = $response->json();

            if ($data === null) {
                Log::error('Finnhub returned non-JSON body', [
                    'endpoint' => $endpoint,
                    'body'     => substr($response->body(), 0, 500),
                ]);
                throw new RuntimeException('INVALID_RESPONSE');
            }

            return $data;

        } catch (RuntimeException $e) {
            // Re-throw our own coded exceptions unchanged so the controller
            // can map them to the correct HTTP response.
            throw $e;
        } catch (\Exception $e) {
            // Catches connection failures, SSL errors, timeouts, and any other
            // non-RuntimeException thrown by the HTTP client.
            // Log the full exception class so the log is actually actionable.
            Log::error('FinnhubService unexpected exception', [
                'endpoint'  => $endpoint,
                'class'     => get_class($e),
                'message'   => $e->getMessage(),
            ]);
            throw new RuntimeException('FINNHUB_REQUEST_FAILED');
        }
    }
}
