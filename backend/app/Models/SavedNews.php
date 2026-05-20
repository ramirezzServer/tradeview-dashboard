<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedNews extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'article_url',
        'headline',
        'source',
        'summary',
        'category',
        'article_datetime',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
