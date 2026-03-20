<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WatchlistItemRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Watchlist;
use App\Models\WatchlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchlistItemController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/watchlists/{watchlist}/items
     * Add a symbol to a watchlist.
     * Returns 409 if the symbol already exists in the watchlist.
     */
    public function store(WatchlistItemRequest $request, Watchlist $watchlist): JsonResponse
    {
        if ($watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist not found.', 404);
        }

        $symbol = $request->validated('symbol');

        // Prevent duplicate symbols in the same watchlist
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

    /**
     * PUT /api/watchlist-items/{item}
     * Update notes or sort order of a watchlist item.
     */
    public function update(WatchlistItemRequest $request, WatchlistItem $item): JsonResponse
    {
        // Verify the item belongs to a watchlist owned by this user
        if ($item->watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist item not found.', 404);
        }

        $item->update($request->validated());

        return $this->success($item, 'Watchlist item updated successfully.');
    }

    /**
     * DELETE /api/watchlist-items/{item}
     * Remove a symbol from a watchlist.
     */
    public function destroy(Request $request, WatchlistItem $item): JsonResponse
    {
        if ($item->watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist item not found.', 404);
        }

        $item->delete();

        return $this->success(null, 'Item removed from watchlist.');
    }
}
