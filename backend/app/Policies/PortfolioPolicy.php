<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Portfolio;
use App\Models\PortfolioItem;

class PortfolioPolicy
{
    public function view(User $user, Portfolio $portfolio): bool
    {
        return $user->id === $portfolio->user_id;
    }

    public function update(User $user, Portfolio $portfolio): bool
    {
        return $user->id === $portfolio->user_id;
    }

    public function delete(User $user, Portfolio $portfolio): bool
    {
        return $user->id === $portfolio->user_id;
    }

    public function manageItem(User $user, PortfolioItem $item): bool
    {
        return $user->id === $item->portfolio->user_id;
    }
}
