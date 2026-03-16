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
       Schema::create('visit_logs', function (Blueprint $table) {

    $table->id();

    $table->foreignId('plan_id')
        ->nullable()
        ->constrained('visit_plans')
        ->nullOnDelete();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->date('visit_date')->nullable();

    $table->string('visit_result')->nullable();

    $table->text('remarks')->nullable();

    $table->foreignId('created_by')
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
        Schema::dropIfExists('visit_logs');
    }
};
