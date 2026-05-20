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

    private const DEFAULT_SETTINGS = [
        'theme'                   => 'dark',
        'currency'                => 'USD',
        'default_resolution'      => 'D',
        'default_symbol'          => 'AAPL',
        'preferred_news_category' => 'general',
        'density'                 => 'Normal',
        'font_size'               => 'Medium',
        'chart_timeframe'         => '1M',
        'notifications'           => [
            'price_alerts'       => true,
            'news_updates'       => true,
            'portfolio_changes'  => true,
            'earnings_reminders' => false,
        ],
        'watchlist_prefs'         => [
            'live_price_updates' => true,
            'flash_animations'   => true,
            'show_sparklines'    => true,
            'sort_by'            => 'Change',
        ],
        'dashboard_prefs'         => [
            'ai_predictions' => true,
            'market_movers'  => true,
            'daily_range'    => true,
            'volume_bars'    => true,
        ],
        'appearance_prefs'        => [
            'accent_color' => 'Blue',
            'chart_style'  => 'Candles',
            'glow_effects' => true,
            'animations'   => true,
        ],
    ];

    private const JSON_PREF_KEYS = [
        'notifications',
        'watchlist_prefs',
        'dashboard_prefs',
        'appearance_prefs',
    ];

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
            self::DEFAULT_SETTINGS
        );

        $this->fillMissingDefaults($settings);

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
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            self::DEFAULT_SETTINGS
        );

        $this->fillMissingDefaults($settings);

        $validated = $request->validated();

        foreach (self::JSON_PREF_KEYS as $key) {
            if (! array_key_exists($key, $validated)) {
                continue;
            }

            if ($validated[$key] === null) {
                $validated[$key] = self::DEFAULT_SETTINGS[$key];
                continue;
            }

            if (is_array($validated[$key])) {
                $validated[$key] = array_merge(
                    self::DEFAULT_SETTINGS[$key],
                    $settings->{$key} ?? [],
                    $validated[$key],
                );
            }
        }

        $settings->fill($validated);
        $settings->save();
        $this->fillMissingDefaults($settings);

        return $this->success($settings, 'Settings updated successfully.');
    }

    private function fillMissingDefaults(UserSetting $settings): void
    {
        $changed = false;

        foreach (self::DEFAULT_SETTINGS as $key => $default) {
            $current = $settings->{$key};

            if ($current === null) {
                $settings->{$key} = $default;
                $changed = true;
                continue;
            }

            if (is_array($default) && is_array($current)) {
                $merged = array_merge($default, $current);
                if ($merged !== $current) {
                    $settings->{$key} = $merged;
                    $changed = true;
                }
            }
        }

        if ($changed) {
            $settings->save();
        }
    }
}
