<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioItemRequest;
use App\Http\Traits\ApiResponse;
use App\Jobs\SendPortfolioChangeNotification;
use App\Models\Portfolio;
use App\Models\PortfolioItem;
use Illuminate\Http\JsonResponse;

class PortfolioItemController extends Controller
{
    use ApiResponse;

    public function store(PortfolioItemRequest $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorize('view', $portfolio);

        $item = $portfolio->items()->create($request->validated());

        SendPortfolioChangeNotification::dispatch($portfolio->user);

        return $this->success($item, 'Item added to portfolio.', 201);
    }

    public function update(PortfolioItemRequest $request, PortfolioItem $item): JsonResponse
    {
        // Eager-load portfolio.user before the policy check so both the
        // policy (needs portfolio.user_id) and the job dispatch (needs User)
        // reuse the same cached relations — no extra lazy queries.
        $item->loadMissing('portfolio.user');

        $this->authorize('manageItem', $item);

        $item->update($request->validated());

        SendPortfolioChangeNotification::dispatch($item->portfolio->user);

        return $this->success($item, 'Portfolio item updated successfully.');
    }

    public function destroy(PortfolioItem $item): JsonResponse
    {
        $item->loadMissing('portfolio.user');

        $this->authorize('manageItem', $item);

        $user = $item->portfolio->user;
        $item->delete();

        SendPortfolioChangeNotification::dispatch($user);

        return $this->success(null, 'Item removed from portfolio.');
    }
}
