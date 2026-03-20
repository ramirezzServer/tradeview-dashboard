<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingsRequest;
use App\Http\Traits\ApiResponse;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/settings
     *
     * Returns the authenticated user's settings.
     * If no settings row exists yet, one is created with safe defaults
     * so the frontend always receives a complete settings object.
     */
    public function show(Request $request): JsonResponse
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'theme'                   => 'dark',
                'currency'                => 'USD',
                'default_resolution'      => 'D',
                'default_symbol'          => 'AAPL',
                'preferred_news_category' => 'general',
            ]
        );

        return $this->success($settings, 'Settings fetched successfully.');
    }

    /**
     * PUT /api/settings
     *
     * Update (or create) the user's settings.
     * Only the fields included in the request are changed — partial updates
     * are fully supported, so the frontend can send one field at a time.
     */
    public function update(SettingsRequest $request): JsonResponse
    {
        $settings = UserSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validated()
        );

        return $this->success($settings, 'Settings updated successfully.');
    }
}
