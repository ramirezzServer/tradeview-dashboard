<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WatchlistItemRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Watchlist;
use App\Models\WatchlistItem;
use Illuminate\Http\JsonResponse;

class WatchlistItemController extends Controller
{
    use ApiResponse;

    public function store(WatchlistItemRequest $request, Watchlist $watchlist): JsonResponse
    {
        $this->authorize('view', $watchlist);

        $symbol = $request->validated('symbol');

        if ($watchlist->items()->where('symbol', $symbol)->exists()) {
            return $this->error("'{$symbol}' is already in this watchlist.", 409);
        }

        $item = $watchlist->items()->create([
            'symbol'     => $symbol,
            'notes'      => $request->validated('notes'),
            'sort_order' => $request->validated('sort_order', 0),
        ]);

        return $this->success($item, 'Item added to watchlist.', 201);
    }

    public function update(WatchlistItemRequest $request, WatchlistItem $item): JsonResponse
    {
        $this->authorize('manageItem', $item);

        $item->update($request->validated());

        return $this->success($item, 'Watchlist item updated successfully.');
    }

    public function destroy(WatchlistItem $item): JsonResponse
    {
        $this->authorize('manageItem', $item);

        $item->delete();

        return $this->success(null, 'Item removed from watchlist.');
    }
}
