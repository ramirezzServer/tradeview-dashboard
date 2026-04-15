<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CryptoController;
use App\Http\Controllers\Api\MarketController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\PortfolioItemController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\WatchlistController;
use App\Http\Controllers\Api\WatchlistItemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Phase 1 — Finnhub Proxy (public, no auth required)
| Phase 2 — Authentication + Persistent user data (Sanctum token auth)
|
| The /api prefix is added automatically by bootstrap/app.php.
|
*/

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1 — Finnhub Proxy (public)
// ═══════════════════════════════════════════════════════════════════════

Route::prefix('market')->group(function () {

    // Real-time price snapshot
    Route::get('/quote/{symbol}', [MarketController::class, 'quote']);

    // OHLCV chart data — query params: resolution, from, to (Unix timestamps)
    Route::get('/candles/{symbol}',     [MarketController::class, 'candles']);

    // Alternative OHLCV provider (Alpha Vantage fallback) — query params: from, to
    // Used automatically when Finnhub plan blocks the primary candles endpoint.
    Route::get('/candles-alt/{symbol}', [MarketController::class, 'alternativeCandles']);

    // General market news — query params: category, minId
    Route::get('/news', [MarketController::class, 'news']);

    // Company profile
    Route::get('/profile/{symbol}', [MarketController::class, 'profile']);

    // Basic financial metrics
    Route::get('/financials/{symbol}', [MarketController::class, 'financials']);

    // Company-specific news — query params: from (YYYY-MM-DD), to (YYYY-MM-DD)
    Route::get('/company-news/{symbol}', [MarketController::class, 'companyNews']);

    // Market movers — top gainers, losers, most active (Alpha Vantage, free plan)
    Route::get('/movers', [MarketController::class, 'movers']);

    // Quarterly earnings history — EPS actual vs estimate (Finnhub, free plan)
    Route::get('/earnings/{symbol}', [MarketController::class, 'earnings']);

    // Crypto spot prices via CoinGecko (free plan, no key needed)
    // query param: symbols=BTC,ETH,SOL
    Route::get('/crypto/prices',    [CryptoController::class, 'prices']);
    Route::get('/crypto/supported', [CryptoController::class, 'supported']);

});

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2 — Authentication
// ═══════════════════════════════════════════════════════════════════════

Route::prefix('auth')->group(function () {

    // Public auth endpoints — no token required
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Protected auth endpoints — token required
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

});

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2 — Protected User Data (all require a valid Sanctum token)
// ═══════════════════════════════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    // ── Watchlists ────────────────────────────────────────────────────
    // GET    /api/watchlists          → list user's watchlists
    // POST   /api/watchlists          → create a watchlist
    // GET    /api/watchlists/{id}     → get one watchlist with items
    // PUT    /api/watchlists/{id}     → rename a watchlist
    // DELETE /api/watchlists/{id}     → delete watchlist + items
    Route::apiResource('watchlists', WatchlistController::class);

    // POST   /api/watchlists/{id}/items   → add symbol to watchlist
    Route::post('watchlists/{watchlist}/items', [WatchlistItemController::class, 'store']);

    // PUT    /api/watchlist-items/{id}    → update notes / sort_order
    // DELETE /api/watchlist-items/{id}   → remove symbol from watchlist
    Route::put('watchlist-items/{item}',    [WatchlistItemController::class, 'update']);
    Route::delete('watchlist-items/{item}', [WatchlistItemController::class, 'destroy']);

    // ── Portfolios ────────────────────────────────────────────────────
    // GET    /api/portfolios          → list user's portfolios
    // POST   /api/portfolios          → create a portfolio
    // GET    /api/portfolios/{id}     → get one portfolio with holdings
    // PUT    /api/portfolios/{id}     → rename a portfolio
    // DELETE /api/portfolios/{id}     → delete portfolio + holdings
    Route::apiResource('portfolios', PortfolioController::class);

    // POST   /api/portfolios/{id}/items   → add a holding
    Route::post('portfolios/{portfolio}/items', [PortfolioItemController::class, 'store']);

    // PUT    /api/portfolio-items/{id}    → update quantity, cost, notes
    // DELETE /api/portfolio-items/{id}   → remove a holding
    Route::put('portfolio-items/{item}',    [PortfolioItemController::class, 'update']);
    Route::delete('portfolio-items/{item}', [PortfolioItemController::class, 'destroy']);

    // ── User Settings ─────────────────────────────────────────────────
    // GET    /api/settings   → fetch (or auto-create with defaults)
    // PUT    /api/settings   → partial or full update
    Route::get('settings', [SettingsController::class, 'show']);
    Route::put('settings', [SettingsController::class, 'update']);

});
