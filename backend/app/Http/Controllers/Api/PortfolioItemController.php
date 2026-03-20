<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioItemRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Portfolio;
use App\Models\PortfolioItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioItemController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/portfolios/{portfolio}/items
     * Add a holding to a portfolio.
     *
     * `average_cost` stores the average purchase price per share.
     * Multiple entries for the same symbol are allowed (different lots).
     */
    public function store(PortfolioItemRequest $request, Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio not found.', 404);
        }

        $item = $portfolio->items()->create($request->validated());

        return $this->success($item, 'Item added to portfolio.', 201);
    }

    /**
     * PUT /api/portfolio-items/{item}
     * Update a portfolio holding (quantity, average cost, notes, etc.).
     */
    public function update(PortfolioItemRequest $request, PortfolioItem $item): JsonResponse
    {
        if ($item->portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio item not found.', 404);
        }

        $item->update($request->validated());

        return $this->success($item, 'Portfolio item updated successfully.');
    }

    /**
     * DELETE /api/portfolio-items/{item}
     * Remove a holding from a portfolio.
     */
    public function destroy(Request $request, PortfolioItem $item): JsonResponse
    {
        if ($item->portfolio->user_id !== $request->user()->id) {
            return $this->error('Portfolio item not found.', 404);
        }

        $item->delete();

        return $this->success(null, 'Item removed from portfolio.');
    }
}
