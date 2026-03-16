<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consumer_monthly_bills', function (Blueprint $table) {

            $table->string('bill_month')->nullable()->change();
            $table->year('bill_year')->nullable()->change();

        });
    }

    public function down(): void
    {
        Schema::table('consumer_monthly_bills', function (Blueprint $table) {

            $table->string('bill_month')->nullable(false)->change();
            $table->year('bill_year')->nullable(false)->change();

        });
    }
};