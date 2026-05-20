<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavedNewsRequest;
use App\Http\Traits\ApiResponse;
use App\Models\SavedNews;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedNewsController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $savedNews = $request->user()
            ->savedNews()
            ->latest()
            ->get();

        return $this->success($savedNews, 'Saved news fetched successfully.', 200, [
            'count' => $savedNews->count(),
        ]);
    }

    public function store(SavedNewsRequest $request): JsonResponse
    {
        $exists = $request->user()
            ->savedNews()
            ->where('article_url', $request->validated('article_url'))
            ->exists();

        if ($exists) {
            return $this->error('Article already saved.', 409);
        }

        $savedArticle = $request->user()->savedNews()->create($request->validated());

        return $this->success($savedArticle, 'Article saved successfully.', 201);
    }

    public function update(SavedNewsRequest $request, SavedNews $savedNews): JsonResponse
    {
        if ($savedNews->user_id !== $request->user()->id) {
            return $this->error('Not found.', 404);
        }

        $savedNews->update(['notes' => $request->validated('notes')]);

        return $this->success($savedNews, 'Notes updated successfully.');
    }

    public function destroy(Request $request, SavedNews $savedNews): JsonResponse
    {
        if ($savedNews->user_id !== $request->user()->id) {
            return $this->error('Not found.', 404);
        }

        $savedNews->delete();

        return $this->success(null, 'Article removed from saved news.');
    }
}
