<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Watchlist>
 */
class WatchlistFactory extends Factory
{
    protected $model = Watchlist::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name'    => fake()->words(2, true) . ' Watchlist',
        ];
    }
}
