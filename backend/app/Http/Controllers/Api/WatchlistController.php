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

    public function store(WatchlistRequest $request): JsonResponse
    {
        $watchlist = $request->user()->watchlists()->create([
            'name' => $request->validated('name'),
        ]);

        return $this->success($watchlist, 'Watchlist created successfully.', 201);
    }

    public function show(Watchlist $watchlist): JsonResponse
    {
        $this->authorize('view', $watchlist);

        $watchlist->load('items');

        return $this->success($watchlist, 'Watchlist fetched successfully.');
    }

    public function update(WatchlistRequest $request, Watchlist $watchlist): JsonResponse
    {
        $this->authorize('update', $watchlist);

        $watchlist->update(['name' => $request->validated('name')]);

        return $this->success($watchlist, 'Watchlist updated successfully.');
    }

    public function destroy(Watchlist $watchlist): JsonResponse
    {
        $this->authorize('delete', $watchlist);

        $watchlist->delete();

        return $this->success(null, 'Watchlist deleted successfully.');
    }
}
