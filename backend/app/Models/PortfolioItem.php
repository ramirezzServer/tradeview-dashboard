<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'portfolio_id',
        'symbol',
        'quantity',
        'average_cost',
        'currency',
        'purchased_at',
        'notes',
    ];

    protected $casts = [
        'quantity'     => 'decimal:8',
        'average_cost' => 'decimal:4',
        'purchased_at' => 'date',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
