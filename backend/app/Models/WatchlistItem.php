<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchlistItem extends Model
{
    use HasFactory;

    protected $fillable = ['watchlist_id', 'symbol', 'notes', 'sort_order'];

    public function watchlist(): BelongsTo
    {
        return $this->belongsTo(Watchlist::class);
    }
}
