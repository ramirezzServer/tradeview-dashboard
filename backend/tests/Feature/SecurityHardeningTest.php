<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\PushSubscription;
use App\Models\SavedNews;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_validation_rejects_invalid_payload(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['name', 'email', 'password']]);
    }

    public function test_login_validation_rejects_invalid_payload(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'not-an-email',
            'password' => '',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['email', 'password']]);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'rate@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $request = $this->withServerVariables(['REMOTE_ADDR' => '10.10.10.10']);

        for ($i = 0; $i < 5; $i++) {
            $request->postJson('/api/auth/login', [
                'email' => 'rate@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(401);
        }

        $request->postJson('/api/auth/login', [
            'email' => 'rate@example.com',
            'password' => 'wrong-password',
        ])
            ->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Too many attempts. Please wait a moment and try again.');
    }

    public function test_saved_news_update_and_delete_do_not_cross_users(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();

        $savedNews = SavedNews::create([
            'user_id' => $owner->id,
            'article_url' => 'https://example.com/market/story',
            'headline' => 'Market story',
            'source' => 'Example',
            'category' => 'Market',
        ]);

        Sanctum::actingAs($other);

        $this->putJson("/api/news/saved/{$savedNews->id}", ['notes' => 'changed'])
            ->assertStatus(404);

        $this->deleteJson("/api/news/saved/{$savedNews->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('saved_news', [
            'id' => $savedNews->id,
            'user_id' => $owner->id,
            'notes' => null,
        ]);
    }

    public function test_push_unsubscribe_only_removes_current_users_subscription(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $endpoint = 'https://push.example.com/subscription/abc';
        $endpointHash = hash('sha256', $endpoint);

        PushSubscription::create([
            'user_id' => $owner->id,
            'endpoint' => $endpoint,
            'endpoint_hash' => $endpointHash,
            'p256dh' => 'owner-key',
            'auth' => 'owner-auth',
        ]);

        PushSubscription::create([
            'user_id' => $other->id,
            'endpoint' => $endpoint,
            'endpoint_hash' => $endpointHash,
            'p256dh' => 'other-key',
            'auth' => 'other-auth',
        ]);

        Sanctum::actingAs($other);

        $this->deleteJson('/api/push/unsubscribe', ['endpoint' => $endpoint])
            ->assertStatus(200);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $owner->id,
            'endpoint_hash' => $endpointHash,
        ]);

        $this->assertDatabaseMissing('push_subscriptions', [
            'user_id' => $other->id,
            'endpoint_hash' => $endpointHash,
        ]);
    }

    public function test_push_subscription_validation_requires_safe_endpoint_and_keys(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/push/subscribe', [
            'endpoint' => 'not-a-url',
            'keys' => ['p256dh' => '', 'auth' => ''],
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['endpoint', 'keys.p256dh', 'keys.auth']]);
    }

    public function test_settings_are_scoped_to_authenticated_user(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();

        Sanctum::actingAs($owner);
        $this->putJson('/api/settings', ['default_symbol' => 'MSFT'])->assertStatus(200);

        Sanctum::actingAs($other);
        $this->getJson('/api/settings')
            ->assertStatus(200)
            ->assertJsonPath('data.default_symbol', 'AAPL');
    }

    public function test_portfolio_item_validation_rejects_invalid_numeric_payloads(): void
    {
        $user = User::factory()->create();
        $portfolio = Portfolio::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $this->postJson("/api/portfolios/{$portfolio->id}/items", [
            'symbol' => 'AAPL',
            'quantity' => -1,
            'average_cost' => 'free',
            'currency' => 'USD',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['quantity', 'average_cost']]);
    }

    public function test_market_provider_failure_response_is_sanitized(): void
    {
        config(['finnhub.api_key' => '']);

        $this->getJson('/api/market/quote/AAPL')
            ->assertStatus(503)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Market data is temporarily unavailable.')
            ->assertJsonMissing(['message' => 'Finnhub API key is not configured on the server.']);
    }

    public function test_market_provider_http_failure_response_is_sanitized(): void
    {
        config(['finnhub.api_key' => 'test-key']);
        Http::fake([
            config('finnhub.base_url', 'https://finnhub.io/api/v1').'/*' => Http::response(['secret' => 'raw-provider-body'], 500),
        ]);

        $this->getJson('/api/market/quote/AAPL')
            ->assertStatus(502)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Market data provider returned an unexpected response.')
            ->assertJsonMissing(['secret' => 'raw-provider-body']);
    }
}
