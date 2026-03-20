<?php

use App\Http\Controllers\Api\MarketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Phase 1: Finnhub Proxy
|--------------------------------------------------------------------------
|
| All routes return JSON. The /api prefix is added by bootstrap/app.php.
| Future phases will add auth-protected routes here (watchlist, portfolio).
|
*/

Route::prefix('market')->group(function () {

    // Quote — real-time price snapshot
    Route::get('/quote/{symbol}', [MarketController::class, 'quote']);

    // Candles — OHLCV chart data
    // Query params: resolution (required), from (required), to (required)
    Route::get('/candles/{symbol}', [MarketController::class, 'candles']);

    // Market news
    // Query params: category (optional, default: general), minId (optional)
    Route::get('/news', [MarketController::class, 'news']);

    // Company profile
    Route::get('/profile/{symbol}', [MarketController::class, 'profile']);

    // Basic financials / metrics
    Route::get('/financials/{symbol}', [MarketController::class, 'financials']);

});
