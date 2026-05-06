<?php

namespace App\Services;

use App\Exceptions\Finnhub\ApiKeyMissingException;
use App\Exceptions\Finnhub\CandleNoDataException;
use App\Exceptions\Finnhub\ForbiddenException;
use App\Exceptions\Finnhub\HttpException;
use App\Exceptions\Finnhub\InvalidResponseException;
use App\Exceptions\Finnhub\ProfileNotFoundException;
use App\Exceptions\Finnhub\RateLimitedException;
use App\Exceptions\Finnhub\RequestFailedException;
use App\Exceptions\Finnhub\UnauthorizedException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function getQuote(string $symbol): array
    {
        $ttl = config('finnhub.cache.quote');
        $key = "finnhub.quote.{$symbol}";

        return Cache::remember($key, $ttl, fn () => $this->get('/quote', ['symbol' => $symbol]));
    }

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
            throw new CandleNoDataException();
        }

        return $data;
    }

    public function getMarketNews(string $category = 'general', int $minId = 0): array
    {
        $ttl = config('finnhub.cache.news');
        $key = "finnhub.news.{$category}.{$minId}";

        return Cache::remember($key, $ttl, fn () => $this->get('/news', [
            'category' => $category,
            'minId'    => $minId,
        ]));
    }

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

    public function getProfile(string $symbol): array
    {
        $ttl = config('finnhub.cache.profile');
        $key = "finnhub.profile.{$symbol}";

        $data = Cache::remember($key, $ttl, fn () => $this->get('/stock/profile2', ['symbol' => $symbol]));

        if (empty($data) || ! isset($data['ticker'])) {
            throw new ProfileNotFoundException();
        }

        return $data;
    }

    public function getFinancials(string $symbol): array
    {
        $ttl = config('finnhub.cache.financials');
        $key = "finnhub.financials.{$symbol}";

        return Cache::remember($key, $ttl, fn () => $this->get('/stock/metric', [
            'symbol' => $symbol,
            'metric' => 'all',
        ]));
    }

    public function getEarnings(string $symbol): array
    {
        $ttl = config('finnhub.cache.financials');
        $key = "finnhub.earnings.{$symbol}";

        $data = Cache::remember($key, $ttl, fn () => $this->get('/stock/earnings', ['symbol' => $symbol]));

        if (! is_array($data)) {
            throw new InvalidResponseException();
        }

        return $data;
    }

    // ─── Internal HTTP ────────────────────────────────────────────────────────

    private function get(string $endpoint, array $params = []): array
    {
        if (empty($this->apiKey)) {
            throw new ApiKeyMissingException();
        }

        $params['token'] = $this->apiKey;

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->get($this->baseUrl . $endpoint, $params);

            $status = $response->status();

            if ($status === 429) {
                Log::warning('Finnhub rate limit hit', ['endpoint' => $endpoint]);
                throw new RateLimitedException();
            }

            if ($status === 401) {
                Log::error('Finnhub returned 401 — API key invalid', ['endpoint' => $endpoint]);
                throw new UnauthorizedException();
            }

            // Key is valid but this endpoint requires a higher plan or is IP-blocked.
            if ($status === 403) {
                Log::warning('Finnhub returned 403 — access forbidden', [
                    'endpoint' => $endpoint,
                    'body'     => $response->body(),
                ]);
                throw new ForbiddenException();
            }

            if ($response->failed()) {
                Log::error('Finnhub HTTP error', [
                    'endpoint' => $endpoint,
                    'status'   => $status,
                    'body'     => substr($response->body(), 0, 500),
                ]);
                throw new HttpException($status);
            }

            $data = $response->json();

            if ($data === null) {
                Log::error('Finnhub returned non-JSON body', [
                    'endpoint' => $endpoint,
                    'body'     => substr($response->body(), 0, 500),
                ]);
                throw new InvalidResponseException();
            }

            return $data;

        } catch (RateLimitedException|UnauthorizedException|ForbiddenException|HttpException|InvalidResponseException|ApiKeyMissingException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('FinnhubService unexpected exception', [
                'endpoint' => $endpoint,
                'class'    => get_class($e),
                'message'  => $e->getMessage(),
            ]);
            throw new RequestFailedException(previous: $e);
        }
    }
}
