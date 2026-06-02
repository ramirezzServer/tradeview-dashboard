<?php

namespace App\Providers;

use App\Models\Portfolio;
use App\Models\PortfolioItem;
use App\Models\Watchlist;
use App\Models\WatchlistItem;
use App\Policies\PortfolioPolicy;
use App\Policies\WatchlistPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many attempts. Please wait a moment and try again.',
                    'data' => null,
                ], 429);
            });
        });

        RateLimiter::for('market', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many market requests. Please wait a moment and try again.',
                    'data' => null,
                ], 429);
            });
        });

        Gate::policy(Watchlist::class, WatchlistPolicy::class);
        Gate::policy(WatchlistItem::class, WatchlistPolicy::class);
        Gate::policy(Portfolio::class, PortfolioPolicy::class);
        Gate::policy(PortfolioItem::class, PortfolioPolicy::class);
    }
}
