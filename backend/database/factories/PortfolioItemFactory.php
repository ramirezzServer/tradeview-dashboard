<?php

namespace Database\Factories;

use App\Models\Portfolio;
use App\Models\PortfolioItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortfolioItem>
 */
class PortfolioItemFactory extends Factory
{
    protected $model = PortfolioItem::class;

    public function definition(): array
    {
        return [
            'portfolio_id' => Portfolio::factory(),
            'symbol'       => strtoupper(fake()->lexify('????')),
            'quantity'     => fake()->randomFloat(4, 0.1, 100),
            'average_cost' => fake()->randomFloat(4, 1, 1000),
            'currency'     => 'USD',
            'purchased_at' => null,
            'notes'        => null,
        ];
    }
}
