<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_items', function (Blueprint $table) {
            // PostgreSQL does not auto-index foreign keys; these columns are used
            // in every "load portfolio with items" query and in the aggregation
            // inside NotificationTriggerService::maybeSendPortfolioChange.
            $table->index('portfolio_id', 'portfolio_items_portfolio_id_idx');
            $table->index(['portfolio_id', 'symbol'], 'portfolio_items_portfolio_id_symbol_idx');
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_items', function (Blueprint $table) {
            $table->dropIndex('portfolio_items_portfolio_id_idx');
            $table->dropIndex('portfolio_items_portfolio_id_symbol_idx');
        });
    }
};
