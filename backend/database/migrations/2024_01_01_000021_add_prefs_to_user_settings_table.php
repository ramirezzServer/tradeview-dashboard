<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->string('density')->default('Normal')->after('dashboard_layout');
            $table->string('font_size')->default('Medium')->after('density');
            $table->string('chart_timeframe')->default('1M')->after('font_size');
            $table->json('notifications')->nullable()->after('chart_timeframe');
            $table->json('watchlist_prefs')->nullable()->after('notifications');
            $table->json('dashboard_prefs')->nullable()->after('watchlist_prefs');
            $table->json('appearance_prefs')->nullable()->after('dashboard_prefs');
        });
    }

    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->dropColumn([
                'density',
                'font_size',
                'chart_timeframe',
                'notifications',
                'watchlist_prefs',
                'dashboard_prefs',
                'appearance_prefs',
            ]);
        });
    }
};
