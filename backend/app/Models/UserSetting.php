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
        'theme',               // dark | light
        'currency',            // 3-letter ISO code, e.g. USD
        'default_resolution',  // chart resolution: 1 5 15 30 60 D W M
        'default_symbol',      // e.g. AAPL
        'preferred_news_category', // general | forex | crypto | merger
        'dashboard_layout',    // JSON widget config (future use)
    ];

    protected $casts = [
        'dashboard_layout' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
