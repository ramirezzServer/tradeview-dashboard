<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WatchlistRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Watchlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/watchlists
     * List all watchlists belonging to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $watchlists = $request->user()
            ->watchlists()
            ->withCount('items')
            ->orderBy('created_at')
            ->get();

        return $this->success($watchlists, 'Watchlists fetched successfully.', 200, [
            'count' => $watchlists->count(),
        ]);
    }

    /**
     * POST /api/watchlists
     * Create a new watchlist for the authenticated user.
     */
    public function store(WatchlistRequest $request): JsonResponse
    {
        $watchlist = $request->user()->watchlists()->create([
            'name' => $request->validated('name'),
        ]);

        return $this->success($watchlist, 'Watchlist created successfully.', 201);
    }

    /**
     * GET /api/watchlists/{watchlist}
     * Return a single watchlist with all its items.
     * Only the owner may access it.
     */
    public function show(Request $request, Watchlist $watchlist): JsonResponse
    {
        if ($watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist not found.', 404);
        }

        $watchlist->load('items');

        return $this->success($watchlist, 'Watchlist fetched successfully.');
    }

    /**
     * PUT /api/watchlists/{watchlist}
     * Rename a watchlist.
     */
    public function update(WatchlistRequest $request, Watchlist $watchlist): JsonResponse
    {
        if ($watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist not found.', 404);
        }

        $watchlist->update(['name' => $request->validated('name')]);

        return $this->success($watchlist, 'Watchlist updated successfully.');
    }

    /**
     * DELETE /api/watchlists/{watchlist}
     * Delete a watchlist and all its items (cascade handled by migration).
     */
    public function destroy(Request $request, Watchlist $watchlist): JsonResponse
    {
        if ($watchlist->user_id !== $request->user()->id) {
            return $this->error('Watchlist not found.', 404);
        }

        $watchlist->delete();

        return $this->success(null, 'Watchlist deleted successfully.');
    }
}
