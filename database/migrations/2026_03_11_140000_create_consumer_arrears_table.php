<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumer_arrears', function (Blueprint $table) {
            $table->id();

            $table->foreignId('consumer_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->integer('months_due')->default(0);
            $table->decimal('total_arrear', 12, 2)->default(0);
            $table->date('last_bill_period')->nullable();

            $table->timestamps();

            $table->unique('consumer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumer_arrears');
    }
};
