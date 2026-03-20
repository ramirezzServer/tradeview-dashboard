<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            // Default symbol shown on Dashboard / Technical Analysis
            $table->string('default_symbol')->default('AAPL')->after('default_resolution');

            // Preferred category for the News page
            $table->string('preferred_news_category')->default('general')->after('default_symbol');
        });
    }

    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->dropColumn(['default_symbol', 'preferred_news_category']);
        });
    }
};
