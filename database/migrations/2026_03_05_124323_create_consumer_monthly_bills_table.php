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
        Schema::create('consumer_monthly_bills', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->constrained('consumers')
        ->cascadeOnDelete();

    $table->string('bill_month');  // Apr
    $table->year('bill_year');     // 2024

    $table->decimal('opening_balance',12,2)->nullable();

    $table->string('bill_status')->nullable();
    $table->string('meter_status')->nullable();

    $table->integer('billed_units')->nullable();

    $table->decimal('billed_amount',12,2)->nullable();

    $table->decimal('paid_amount',12,2)->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consumer_monthly_bills');
    }
};
