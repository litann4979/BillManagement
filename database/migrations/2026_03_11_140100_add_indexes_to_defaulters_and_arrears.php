<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('defaulters', function (Blueprint $table) {
            $table->index(['consumer_id', 'bill_period']);
        });
    }

    public function down(): void
    {
        Schema::table('defaulters', function (Blueprint $table) {
            $table->dropIndex(['consumer_id', 'bill_period']);
        });
    }
};
