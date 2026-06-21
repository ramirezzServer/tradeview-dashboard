<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $portfolios = $request->user()
            ->portfolios()
            ->withCount('items')
            ->orderBy('created_at')
            ->get();

        return $this->success($portfolios, 'Portfolios fetched successfully.', 200, [
            'count' => $portfolios->count(),
        ]);
    }

    public function store(PortfolioRequest $request): JsonResponse
    {
        $portfolio = $request->user()->portfolios()->create([
            'name' => $request->validated('name'),
        ]);

        return $this->success($portfolio, 'Portfolio created successfully.', 201);
    }

    public function show(Portfolio $portfolio): JsonResponse
    {
        $this->authorize('view', $portfolio);

        $portfolio->load('items');

        return $this->success($portfolio, 'Portfolio fetched successfully.');
    }

    public function update(PortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorize('update', $portfolio);

        $portfolio->update(['name' => $request->validated('name')]);

        return $this->success($portfolio, 'Portfolio updated successfully.');
    }

    public function destroy(Portfolio $portfolio): JsonResponse
    {
        $this->authorize('delete', $portfolio);

        $portfolio->delete();

        return $this->success(null, 'Portfolio deleted successfully.');
    }
}
