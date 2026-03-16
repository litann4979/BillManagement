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
       Schema::create('payments', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->foreignId('bill_id')
        ->nullable()
        ->constrained('consumer_monthly_bills')
        ->nullOnDelete();

    $table->decimal('payment_amount',12,2)->nullable();

    $table->string('payment_mode')->nullable();

    $table->string('receipt_no')->nullable();

    $table->date('payment_date')->nullable();

    $table->foreignId('collected_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
