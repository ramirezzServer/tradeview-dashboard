<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\PortfolioItem;
use App\Models\User;
use App\Models\Watchlist;
use App\Models\WatchlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnershipTest extends TestCase
{
    use RefreshDatabase;

    // ─── Unauthenticated ─────────────────────────────────────────────────────

    public function test_unauthenticated_request_is_rejected(): void
    {
        $watchlist = Watchlist::factory()->create();

        $this->getJson("/api/watchlists/{$watchlist->id}")->assertStatus(401);
    }

    // ─── Watchlist ────────────────────────────────────────────────────────────

    public function test_cannot_view_another_users_watchlist(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $watchlist = Watchlist::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->getJson("/api/watchlists/{$watchlist->id}")->assertStatus(404);
    }

    public function test_cannot_update_another_users_watchlist(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $watchlist = Watchlist::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->putJson("/api/watchlists/{$watchlist->id}", ['name' => 'Hacked'])->assertStatus(404);
    }

    public function test_cannot_delete_another_users_watchlist(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $watchlist = Watchlist::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->deleteJson("/api/watchlists/{$watchlist->id}")->assertStatus(404);
    }

    public function test_owner_can_view_their_own_watchlist(): void
    {
        $owner = User::factory()->create();
        $watchlist = Watchlist::factory()->for($owner)->create();

        Sanctum::actingAs($owner);
        $this->getJson("/api/watchlists/{$watchlist->id}")->assertStatus(200);
    }

    // ─── WatchlistItem ────────────────────────────────────────────────────────

    public function test_cannot_update_another_users_watchlist_item(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $watchlist = Watchlist::factory()->for($owner)->create();
        $item = WatchlistItem::factory()->for($watchlist)->create();

        Sanctum::actingAs($other);
        $this->putJson("/api/watchlist-items/{$item->id}", ['notes' => 'hacked'])->assertStatus(404);
    }

    public function test_cannot_delete_another_users_watchlist_item(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $watchlist = Watchlist::factory()->for($owner)->create();
        $item = WatchlistItem::factory()->for($watchlist)->create();

        Sanctum::actingAs($other);
        $this->deleteJson("/api/watchlist-items/{$item->id}")->assertStatus(404);
    }

    // ─── Portfolio ────────────────────────────────────────────────────────────

    public function test_cannot_view_another_users_portfolio(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $portfolio = Portfolio::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->getJson("/api/portfolios/{$portfolio->id}")->assertStatus(404);
    }

    public function test_cannot_update_another_users_portfolio(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $portfolio = Portfolio::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->putJson("/api/portfolios/{$portfolio->id}", ['name' => 'Hacked'])->assertStatus(404);
    }

    public function test_cannot_delete_another_users_portfolio(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $portfolio = Portfolio::factory()->for($owner)->create();

        Sanctum::actingAs($other);
        $this->deleteJson("/api/portfolios/{$portfolio->id}")->assertStatus(404);
    }

    public function test_owner_can_view_their_own_portfolio(): void
    {
        $owner = User::factory()->create();
        $portfolio = Portfolio::factory()->for($owner)->create();

        Sanctum::actingAs($owner);
        $this->getJson("/api/portfolios/{$portfolio->id}")->assertStatus(200);
    }

    // ─── PortfolioItem ────────────────────────────────────────────────────────

    public function test_cannot_update_another_users_portfolio_item(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $portfolio = Portfolio::factory()->for($owner)->create();
        $item = PortfolioItem::factory()->for($portfolio)->create();

        Sanctum::actingAs($other);
        $this->putJson("/api/portfolio-items/{$item->id}", ['quantity' => 99])->assertStatus(404);
    }

    public function test_cannot_delete_another_users_portfolio_item(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $portfolio = Portfolio::factory()->for($owner)->create();
        $item = PortfolioItem::factory()->for($portfolio)->create();

        Sanctum::actingAs($other);
        $this->deleteJson("/api/portfolio-items/{$item->id}")->assertStatus(404);
    }
}
