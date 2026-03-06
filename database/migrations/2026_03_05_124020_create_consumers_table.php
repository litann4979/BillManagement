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
       Schema::create('consumers', function (Blueprint $table) {

    $table->id();

    $table->foreignId('billcollector_id')
        ->nullable()
        ->constrained('users')
        ->cascadeOnDelete();

    $table->string('subdivision')->nullable();
    $table->string('section')->nullable();

    $table->string('scno')->unique();
    $table->string('name')->nullable();

    $table->string('address_1')->nullable();
    $table->string('address_2')->nullable();
    $table->string('address_3')->nullable();

    $table->string('email')->nullable();
    $table->string('phone')->nullable();

    $table->string('gis_location')->nullable();

    $table->date('date_of_connection')->nullable();

    $table->string('dtr_name')->nullable();
    $table->string('dtr_code')->nullable();

    $table->string('bill_grp')->nullable();
    $table->string('category')->nullable();

    $table->string('meter_no')->nullable();

    $table->decimal('cd',10,2)->nullable();

    $table->decimal('closing_balance',12,2)->nullable();

    $table->decimal('cfy',12,2)->nullable();

    $table->decimal('ecl_arrear',12,2)->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consumers');
    }
};
