<?php

namespace App\Providers;

use App\Models\Portfolio;
use App\Models\PortfolioItem;
use App\Models\Watchlist;
use App\Models\WatchlistItem;
use App\Policies\PortfolioPolicy;
use App\Policies\WatchlistPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(Watchlist::class, WatchlistPolicy::class);
        Gate::policy(WatchlistItem::class, WatchlistPolicy::class);
        Gate::policy(Portfolio::class, PortfolioPolicy::class);
        Gate::policy(PortfolioItem::class, PortfolioPolicy::class);
    }
}
