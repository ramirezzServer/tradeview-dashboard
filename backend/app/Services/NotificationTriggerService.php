<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

class NotificationTriggerService
{
    public function __construct(private readonly PushNotificationService $push) {}

    public function maybeSendPriceAlert(string $symbol, array $quote): void
    {
        $price = (float) ($quote['c'] ?? 0);
        if ($price <= 0) {
            return;
        }

        $cacheKey = "push.price.last.{$symbol}";
        $previous = Cache::get($cacheKey);
        Cache::put($cacheKey, $price, now()->addDay());

        if (! is_numeric($previous) || (float) $previous <= 0) {
            return;
        }

        $changePercent = (($price - (float) $previous) / (float) $previous) * 100;
        if (abs($changePercent) < 2) {
            return;
        }

        $users = User::query()
            ->whereHas('pushSubscriptions')
            ->whereHas('watchlists.items', fn ($query) => $query->where('symbol', $symbol))
            ->with('settings')
            ->get();

        foreach ($users as $user) {
            if (! $this->notificationEnabled($user, 'price_alerts', true)) {
                continue;
            }

            if (! Cache::add("push.price.cooldown.{$user->id}.{$symbol}", true, now()->addMinutes(30))) {
                continue;
            }

            $direction = $changePercent > 0 ? 'up' : 'down';
            $this->push->sendToUser(
                $user,
                "{$symbol} moved {$direction}",
                sprintf('%s changed %.2f%% to $%.2f.', $symbol, $changePercent, $price),
                '/watchlist'
            );
        }
    }

    public function maybeSendNewsUpdate(string $category, array $articles): void
    {
        $ids = collect($articles)
            ->pluck('id')
            ->filter(fn ($id) => is_numeric($id));

        if ($ids->isEmpty()) {
            return;
        }

        $latestId = (int) $ids->max();
        $cacheKey = "push.news.latest.{$category}";
        $previous = Cache::get($cacheKey);
        Cache::put($cacheKey, $latestId, now()->addDays(7));

        if (! is_numeric($previous) || $latestId <= (int) $previous) {
            return;
        }

        $headline = collect($articles)
            ->sortByDesc(fn ($article) => (int) ($article['id'] ?? 0))
            ->first()['headline'] ?? 'New market news is available.';

        $users = User::query()
            ->whereHas('pushSubscriptions')
            ->with('settings')
            ->get();

        foreach ($users as $user) {
            if (($user->settings?->preferred_news_category ?? 'general') !== $category) {
                continue;
            }

            if (! $this->notificationEnabled($user, 'news_updates', true)) {
                continue;
            }

            $this->push->sendToUser($user, 'Market news update', $headline, '/news');
        }
    }

    public function maybeSendPortfolioChange(User $user): void
    {
        if (! $this->notificationEnabled($user, 'portfolio_changes', true)) {
            return;
        }

        $total = $user->portfolios()
            ->with('items')
            ->get()
            ->flatMap(fn ($portfolio) => $portfolio->items)
            ->sum(fn ($item) => (float) $item->quantity * (float) $item->average_cost);

        $cacheKey = "push.portfolio.total.{$user->id}";
        $previous = Cache::get($cacheKey);
        Cache::put($cacheKey, $total, now()->addDay());

        if (! is_numeric($previous) || (float) $previous <= 0) {
            return;
        }

        $changePercent = (($total - (float) $previous) / (float) $previous) * 100;
        if (abs($changePercent) < 1) {
            return;
        }

        if (! Cache::add("push.portfolio.cooldown.{$user->id}", true, now()->addMinutes(30))) {
            return;
        }

        $this->push->sendToUser(
            $user,
            'Portfolio changed',
            sprintf('Your portfolio value changed %.2f%%.', $changePercent),
            '/portfolio'
        );
    }

    public function maybeSendEarningsReminder(string $symbol, array $earnings): void
    {
        $upcoming = collect($earnings)
            ->map(fn ($item) => $item['date'] ?? $item['period'] ?? null)
            ->filter()
            ->map(fn ($date) => $this->parseDate($date))
            ->filter()
            ->first(fn (CarbonImmutable $date) => $date->betweenIncluded(
                now()->toImmutable()->startOfDay(),
                now()->toImmutable()->addDays(7)->endOfDay()
            ));

        if (! $upcoming) {
            return;
        }

        $users = User::query()
            ->whereHas('pushSubscriptions')
            ->whereHas('watchlists.items', fn ($query) => $query->where('symbol', $symbol))
            ->with('settings')
            ->get();

        foreach ($users as $user) {
            if (! $this->notificationEnabled($user, 'earnings_reminders', false)) {
                continue;
            }

            $dayKey = $upcoming->toDateString();
            if (! Cache::add("push.earnings.{$user->id}.{$symbol}.{$dayKey}", true, now()->addDay())) {
                continue;
            }

            $this->push->sendToUser(
                $user,
                "{$symbol} earnings reminder",
                "{$symbol} has earnings scheduled within the next 7 days.",
                '/financials'
            );
        }
    }

    private function notificationEnabled(User $user, string $key, bool $default): bool
    {
        return (bool) data_get($user->settings?->notifications, $key, $default);
    }

    private function parseDate(string $date): ?CarbonImmutable
    {
        try {
            return CarbonImmutable::parse($date);
        } catch (\Throwable) {
            return null;
        }
    }
}
