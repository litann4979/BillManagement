<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('defaulters', function (Blueprint $table) {

            // Remove old columns
            $table->dropColumn([
                'months_due',
                'total_arrear'
            ]);

            // Add new columns
            $table->date('bill_period')->after('consumer_id');
            $table->decimal('amount_due', 12, 2)->after('bill_period');

            // Optional: make status default
            $table->string('status')->default('active')->change();
        });
    }

    public function down(): void
    {
        Schema::table('defaulters', function (Blueprint $table) {

            // Remove new columns
            $table->dropColumn([
                'bill_period',
                'amount_due'
            ]);

            // Restore old columns
            $table->integer('months_due')->nullable();
            $table->decimal('total_arrear', 12, 2)->nullable();
        });
    }
};