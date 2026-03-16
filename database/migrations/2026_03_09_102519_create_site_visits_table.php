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
       Schema::create('site_visits', function (Blueprint $table) {

    $table->id();

    $table->foreignId('consumer_id')
        ->nullable()
        ->constrained()
        ->nullOnDelete();

    $table->string('email_collected')->nullable();

    $table->string('phone_collected')->nullable();

    $table->string('meter_bypass_photo')->nullable();

    $table->string('evidence_video')->nullable();

    $table->decimal('latitude',10,7)->nullable();

    $table->decimal('longitude',10,7)->nullable();

    $table->string('action_taken')->nullable();

    $table->string('status')->nullable();

    $table->foreignId('captured_by')
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
        Schema::dropIfExists('site_visits');
    }
};
