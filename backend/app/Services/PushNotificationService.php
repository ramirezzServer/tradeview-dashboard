<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushNotificationService
{
    public function sendToUser(User $user, string $title, string $body, string $url): void
    {
        $auth = [
            'VAPID' => [
                'subject'    => config('webpush.vapid.subject'),
                'publicKey'  => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        if (! $auth['VAPID']['publicKey'] || ! $auth['VAPID']['privateKey']) {
            Log::warning('Web Push skipped because VAPID keys are not configured.');
            return;
        }

        $subscriptions = $user->pushSubscriptions()->get();
        if ($subscriptions->isEmpty()) {
            return;
        }

        $webPush = new WebPush($auth);
        $payload = json_encode([
            'title' => $title,
            'body'  => $body,
            'url'   => $url,
            'icon'  => '/favicon.ico',
        ], JSON_THROW_ON_ERROR);

        foreach ($subscriptions as $subscription) {
            try {
                $report = $webPush->sendOneNotification(
                    Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'keys'     => [
                            'p256dh' => $subscription->p256dh,
                            'auth'   => $subscription->auth,
                        ],
                    ]),
                    $payload
                );

                if ($report->isSubscriptionExpired()) {
                    $subscription->delete();
                } elseif (! $report->isSuccess()) {
                    Log::warning('Web Push delivery failed.', [
                        'user_id'       => $user->id,
                        'subscription'  => $subscription->endpoint_hash,
                        'reason'        => $report->getReason(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Web Push delivery threw an exception.', [
                    'user_id'      => $user->id,
                    'subscription' => $subscription->endpoint_hash,
                    'class'        => get_class($e),
                ]);
            }
        }
    }
}
