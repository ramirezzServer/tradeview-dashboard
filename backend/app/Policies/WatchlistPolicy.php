<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Watchlist;
use App\Models\WatchlistItem;

class WatchlistPolicy
{
    public function view(User $user, Watchlist $watchlist): bool
    {
        return $user->id === $watchlist->user_id;
    }

    public function update(User $user, Watchlist $watchlist): bool
    {
        return $user->id === $watchlist->user_id;
    }

    public function delete(User $user, Watchlist $watchlist): bool
    {
        return $user->id === $watchlist->user_id;
    }

    public function manageItem(User $user, WatchlistItem $item): bool
    {
        return $user->id === $item->watchlist->user_id;
    }
}
