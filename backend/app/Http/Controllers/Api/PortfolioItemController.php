<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioItemRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Portfolio;
use App\Models\PortfolioItem;
use App\Services\NotificationTriggerService;
use Illuminate\Http\JsonResponse;

class PortfolioItemController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly NotificationTriggerService $notifications) {}

    public function store(PortfolioItemRequest $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorize('view', $portfolio);

        $item = $portfolio->items()->create($request->validated());

        $this->notifications->maybeSendPortfolioChange($portfolio->user);

        return $this->success($item, 'Item added to portfolio.', 201);
    }

    public function update(PortfolioItemRequest $request, PortfolioItem $item): JsonResponse
    {
        $this->authorize('manageItem', $item);

        $item->update($request->validated());

        $this->notifications->maybeSendPortfolioChange($item->portfolio->user);

        return $this->success($item, 'Portfolio item updated successfully.');
    }

    public function destroy(PortfolioItem $item): JsonResponse
    {
        $this->authorize('manageItem', $item);

        $user = $item->portfolio->user;
        $item->delete();

        $this->notifications->maybeSendPortfolioChange($user);

        return $this->success(null, 'Item removed from portfolio.');
    }
}
