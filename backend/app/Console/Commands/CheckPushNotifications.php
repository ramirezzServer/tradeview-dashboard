<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FinnhubService;
use App\Services\NotificationTriggerService;
use Illuminate\Console\Command;

class CheckPushNotifications extends Command
{
    protected $signature = 'push:check {--earnings : Check earnings reminders instead of price alerts}';

    protected $description = 'Check subscribed users for price alerts or earnings reminders.';

    public function handle(FinnhubService $finnhub, NotificationTriggerService $notifications): int
    {
        $key = $this->option('earnings') ? 'earnings_reminders' : 'price_alerts';
        $default = $key === 'price_alerts';
        $symbols = $this->watchedSymbols($key, $default);

        foreach ($symbols as $symbol) {
            try {
                if ($this->option('earnings')) {
                    $notifications->maybeSendEarningsReminder($symbol, $finnhub->getEarnings($symbol));
                } else {
                    $notifications->maybeSendPriceAlert($symbol, $finnhub->getQuote($symbol));
                }
            } catch (\RuntimeException $e) {
                $this->warn("Skipped {$symbol}: {$e->getMessage()}");
            }
        }

        $this->info(sprintf('Checked %d symbol(s).', count($symbols)));

        return self::SUCCESS;
    }

    /**
     * @return string[]
     */
    private function watchedSymbols(string $notificationKey, bool $default): array
    {
        return User::query()
            ->whereHas('pushSubscriptions')
            ->with(['settings', 'watchlists.items'])
            ->get()
            ->filter(fn (User $user) => (bool) data_get($user->settings?->notifications, $notificationKey, $default))
            ->flatMap(fn (User $user) => $user->watchlists->flatMap->items->pluck('symbol'))
            ->map(fn ($symbol) => strtoupper((string) $symbol))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
