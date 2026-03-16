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
       Schema::create('defaulters', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->integer('months_due')->nullable();

    $table->decimal('total_arrear',12,2)->nullable();

    $table->string('status')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('defaulters');
    }
};
