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
       Schema::create('grievances', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->string('complaint_type')->nullable();

    $table->text('description')->nullable();

    $table->string('status')->nullable();

    $table->foreignId('resolved_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->timestamp('resolved_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grievances');
    }
};
