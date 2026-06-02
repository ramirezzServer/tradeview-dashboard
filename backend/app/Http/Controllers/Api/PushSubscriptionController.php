<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PushSubscriptionRequest;
use App\Http\Traits\ApiResponse;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;

class PushSubscriptionController extends Controller
{
    use ApiResponse;

    public function store(PushSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $endpointHash = hash('sha256', $validated['endpoint']);

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id'       => $request->user()->id,
                'endpoint_hash' => $endpointHash,
            ],
            [
                'endpoint' => $validated['endpoint'],
                'p256dh'   => $validated['keys']['p256dh'],
                'auth'     => $validated['keys']['auth'],
            ]
        );

        return $this->success($subscription, 'Push subscription saved.', 201);
    }

    public function destroy(PushSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $endpointHash = hash('sha256', $validated['endpoint']);

        $request->user()
            ->pushSubscriptions()
            ->where('endpoint_hash', $endpointHash)
            ->delete();

        return $this->success(null, 'Push subscription removed.');
    }
}
