<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->string('endpoint_hash', 64)->nullable()->after('endpoint');
        });

        DB::table('push_subscriptions')
            ->orderBy('id')
            ->select(['id', 'endpoint'])
            ->chunkById(100, function ($subscriptions) {
                foreach ($subscriptions as $subscription) {
                    DB::table('push_subscriptions')
                        ->where('id', $subscription->id)
                        ->update(['endpoint_hash' => hash('sha256', $subscription->endpoint)]);
                }
            });

        DB::table('push_subscriptions')
            ->orderBy('id')
            ->get(['id', 'user_id', 'endpoint_hash'])
            ->groupBy(fn ($subscription) => $subscription->user_id . ':' . $subscription->endpoint_hash)
            ->each(function ($duplicates) {
                $idsToDelete = $duplicates->pluck('id')->slice(1);

                if ($idsToDelete->isNotEmpty()) {
                    DB::table('push_subscriptions')
                        ->whereIn('id', $idsToDelete->all())
                        ->delete();
                }
            });

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->unique(['user_id', 'endpoint_hash'], 'push_subscriptions_user_endpoint_hash_unique');
        });
    }

    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropUnique('push_subscriptions_user_endpoint_hash_unique');
            $table->dropColumn('endpoint_hash');
        });
    }
};
