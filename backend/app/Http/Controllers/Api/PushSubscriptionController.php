<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint'     => ['required', 'string'],
            'keys.p256dh'  => ['required', 'string'],
            'keys.auth'    => ['required', 'string'],
        ]);
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

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string'],
        ]);
        $endpointHash = hash('sha256', $validated['endpoint']);

        $request->user()
            ->pushSubscriptions()
            ->where('endpoint_hash', $endpointHash)
            ->delete();

        return $this->success(null, 'Push subscription removed.');
    }
}
