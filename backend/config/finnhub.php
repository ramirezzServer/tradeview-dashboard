<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Finnhub API Configuration
    |--------------------------------------------------------------------------
    |
    | The API key is read ONLY from the .env file — never hardcoded here.
    |
    */

    'api_key'  => env('FINNHUB_API_KEY', ''),
    'base_url' => env('FINNHUB_BASE_URL', 'https://finnhub.io/api/v1'),

    /*
    |--------------------------------------------------------------------------
    | Cache TTLs (in seconds)
    |--------------------------------------------------------------------------
    |
    | Tune these to balance freshness vs. Finnhub rate-limit usage.
    | Quote is short because prices move fast.
    | Profile/Financials are long because they rarely change.
    |
    */

    'cache' => [
        'quote'      => (int) env('FINNHUB_CACHE_QUOTE', 30),
        'candles'    => (int) env('FINNHUB_CACHE_CANDLES', 300),
        'news'       => (int) env('FINNHUB_CACHE_NEWS', 300),
        'profile'    => (int) env('FINNHUB_CACHE_PROFILE', 3600),
        'financials' => (int) env('FINNHUB_CACHE_FINANCIALS', 3600),
    ],

];
