<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Existing fields ───────────────────────────────────────────────
            'theme'                   => ['sometimes', 'string', 'in:dark,light'],
            'currency'                => ['sometimes', 'string', 'size:3'],
            'default_resolution'      => ['sometimes', 'string', 'in:1,5,15,30,60,D,W,M'],
            'default_symbol'          => ['sometimes', 'string', 'max:20', 'regex:/^[A-Z0-9.:\-]{1,20}$/'],
            'preferred_news_category' => ['sometimes', 'string', 'in:general,forex,crypto,merger'],
            'dashboard_layout'        => ['sometimes', 'nullable', 'array'],

            // ── Display ───────────────────────────────────────────────────────
            'density'        => ['sometimes', 'string', 'in:Compact,Normal,Relaxed'],
            'font_size'      => ['sometimes', 'string', 'in:Small,Medium,Large'],
            'chart_timeframe'=> ['sometimes', 'string', 'in:1D,1W,1M,3M'],

            // ── Notification prefs ────────────────────────────────────────────
            'notifications'                      => ['sometimes', 'nullable', 'array'],
            'notifications.price_alerts'         => ['sometimes', 'boolean'],
            'notifications.news_updates'         => ['sometimes', 'boolean'],
            'notifications.portfolio_changes'    => ['sometimes', 'boolean'],
            'notifications.earnings_reminders'   => ['sometimes', 'boolean'],

            // ── Watchlist prefs ───────────────────────────────────────────────
            'watchlist_prefs'                        => ['sometimes', 'nullable', 'array'],
            'watchlist_prefs.live_price_updates'     => ['sometimes', 'boolean'],
            'watchlist_prefs.flash_animations'       => ['sometimes', 'boolean'],
            'watchlist_prefs.show_sparklines'        => ['sometimes', 'boolean'],
            'watchlist_prefs.sort_by'                => ['sometimes', 'string', 'in:Symbol,Change,Volume'],

            // ── Dashboard prefs ───────────────────────────────────────────────
            'dashboard_prefs'                    => ['sometimes', 'nullable', 'array'],
            'dashboard_prefs.ai_predictions'     => ['sometimes', 'boolean'],
            'dashboard_prefs.market_movers'      => ['sometimes', 'boolean'],
            'dashboard_prefs.daily_range'        => ['sometimes', 'boolean'],
            'dashboard_prefs.volume_bars'        => ['sometimes', 'boolean'],

            // ── Appearance prefs ──────────────────────────────────────────────
            'appearance_prefs'                   => ['sometimes', 'nullable', 'array'],
            'appearance_prefs.accent_color'      => ['sometimes', 'string', 'in:Blue,Cyan,Green,Purple'],
            'appearance_prefs.chart_style'       => ['sometimes', 'string', 'in:Candles,Line,Area'],
            'appearance_prefs.glow_effects'      => ['sometimes', 'boolean'],
            'appearance_prefs.animations'        => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'theme.in'                   => 'Theme must be dark or light.',
            'default_resolution.in'      => 'Resolution must be one of: 1, 5, 15, 30, 60, D, W, M.',
            'preferred_news_category.in' => 'News category must be: general, forex, crypto, or merger.',
            'default_symbol.regex'       => 'Default symbol must contain only uppercase letters, digits, dots, colons, or hyphens.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('default_symbol')) {
            $this->merge(['default_symbol' => strtoupper(trim($this->input('default_symbol', '')))]);
        }

        if ($this->has('currency')) {
            $this->merge(['currency' => strtoupper(trim($this->input('currency', 'USD')))]);
        }
    }
}
