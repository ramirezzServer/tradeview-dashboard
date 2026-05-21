<?php

return [
    'base_url' => env('COINGECKO_BASE_URL', 'https://api.coingecko.com/api/v3'),
    'cache_ttl' => (int) env('COINGECKO_CACHE_TTL', 30),
];
