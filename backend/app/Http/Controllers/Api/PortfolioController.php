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

    /**
     * GET /api/portfolios
     * List all portfolios belonging to the authenticated user.
     */
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

    /**
     * POST /api/portfolios
     * Create a new portfolio for the authenticated user.
     */
    public function store(PortfolioRequest $request): JsonResponse
    {
        $portfolio = $request->user()->portfolios()->create([
            'name' => $request->validated('name'),
        ]);

        return $this->success($portfolio, 'Portfolio created successfully.', 201);
    }

    /**
     * GET /api/portfolios/{portfolio}
     * Return a single portfolio with all its holdings.
     * Only the owner may access it.
     */
    public function show(Request $request, Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio not found.', 404);
        }

        $portfolio->load('items');

        return $this->success($portfolio, 'Portfolio fetched successfully.');
    }

    /**
     * PUT /api/portfolios/{portfolio}
     * Rename a portfolio.
     */
    public function update(PortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio not found.', 404);
        }

        $portfolio->update(['name' => $request->validated('name')]);

        return $this->success($portfolio, 'Portfolio updated successfully.');
    }

    /**
     * DELETE /api/portfolios/{portfolio}
     * Delete a portfolio and all its items (cascade handled by migration).
     */
    public function destroy(Request $request, Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio not found.', 404);
        }

        $portfolio->delete();

        return $this->success(null, 'Portfolio deleted successfully.');
    }
}
