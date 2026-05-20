<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'theme',                   // dark | light
        'currency',                // 3-letter ISO code, e.g. USD
        'default_resolution',      // chart resolution: 1 5 15 30 60 D W M
        'default_symbol',          // e.g. AAPL
        'preferred_news_category', // general | forex | crypto | merger
        'dashboard_layout',        // JSON widget config (legacy)
        'density',                 // Compact | Normal | Relaxed
        'font_size',               // Small | Medium | Large
        'chart_timeframe',         // 1D | 1W | 1M | 3M
        'notifications',           // JSON: price_alerts, news_updates, portfolio_changes, earnings_reminders
        'watchlist_prefs',         // JSON: live_price_updates, flash_animations, show_sparklines, sort_by
        'dashboard_prefs',         // JSON: ai_predictions, market_movers, daily_range, volume_bars
        'appearance_prefs',        // JSON: accent_color, chart_style, glow_effects, animations
    ];

    protected $casts = [
        'dashboard_layout'  => 'array',
        'notifications'     => 'array',
        'watchlist_prefs'   => 'array',
        'dashboard_prefs'   => 'array',
        'appearance_prefs'  => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
