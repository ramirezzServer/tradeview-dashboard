<?php

namespace Database\Factories;

use App\Models\Watchlist;
use App\Models\WatchlistItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WatchlistItem>
 */
class WatchlistItemFactory extends Factory
{
    protected $model = WatchlistItem::class;

    public function definition(): array
    {
        return [
            'watchlist_id' => Watchlist::factory(),
            'symbol'       => strtoupper(fake()->unique()->lexify('????')),
            'notes'        => null,
            'sort_order'   => 0,
        ];
    }
}
