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
       Schema::table('consumers', function (Blueprint $table) {
    $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('feeder_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('dtr_id')->nullable()->constrained()->nullOnDelete();

    $table->decimal('latitude',10,7)->nullable();
    $table->decimal('longitude',10,7)->nullable();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
