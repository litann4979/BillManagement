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
       Schema::create('unauthorized_connections', function (Blueprint $table) {

    $table->id();

    $table->string('name')->nullable();

    $table->string('address')->nullable();

    $table->string('aadhaar_number')->nullable();

    $table->string('aadhaar_photo')->nullable();

    $table->decimal('latitude',10,7)->nullable();

    $table->decimal('longitude',10,7)->nullable();

    $table->string('evidence_photo')->nullable();

    $table->string('evidence_video')->nullable();

    $table->foreignId('reported_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->string('status')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unauthorized_connections');
    }
};
