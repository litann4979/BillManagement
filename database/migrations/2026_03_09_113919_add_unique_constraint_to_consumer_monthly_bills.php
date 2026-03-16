<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('consumer_monthly_bills', function (Blueprint $table) {

    $table->unique(['consumer_id','bill_period']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consumer_monthly_bills', function (Blueprint $table) {
    $table->dropUnique(['consumer_id','bill_period']);
        });
    }
};
