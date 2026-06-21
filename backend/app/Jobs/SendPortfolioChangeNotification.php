<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\NotificationTriggerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPortfolioChangeNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly User $user) {}

    public function handle(NotificationTriggerService $notifications): void
    {
        $notifications->maybeSendPortfolioChange($this->user);
    }
}
