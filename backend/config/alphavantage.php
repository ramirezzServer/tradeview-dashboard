<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Alpha Vantage Configuration
    |--------------------------------------------------------------------------
    |
    | Used as a fallback candle / OHLCV data provider when the Finnhub plan
    | does not include historical intraday/daily candles.
    |
    | Free tier: 25 requests / day (sufficient for demo / development use).
    | Get a free key at: https://www.alphavantage.co/support/#api-key
    |
    */

    'key'      => env('ALPHA_VANTAGE_KEY', ''),
    'base_url' => 'https://www.alphavantage.co/query',

    'cache_ttl' => [
        // Daily candles — AV free data refreshes once per trading day; cache for 30 min.
        'daily_candles' => (int) env('AV_CACHE_CANDLES', 1800),
    ],

];
