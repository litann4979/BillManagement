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
      Schema::create('consumer_flags', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->string('flag_type')->nullable();

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
        Schema::dropIfExists('consumer_flags');
    }
};
