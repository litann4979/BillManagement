<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_plan_consumers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('plan_id')
                ->constrained('visit_plans')
                ->cascadeOnDelete();

            $table->foreignId('consumer_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['plan_id', 'consumer_id']);
        });

        if (!Schema::hasColumn('visit_plans', 'visit_time')) {
            Schema::table('visit_plans', function (Blueprint $table) {
                $table->time('visit_time')->nullable()->after('plan_date');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_plan_consumers');

        if (Schema::hasColumn('visit_plans', 'visit_time')) {
            Schema::table('visit_plans', function (Blueprint $table) {
                $table->dropColumn('visit_time');
            });
        }
    }
};
