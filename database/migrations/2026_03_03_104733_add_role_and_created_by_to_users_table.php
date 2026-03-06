<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->foreignId('role_id')
                  ->nullable()
                  ->after('password')
                  ->constrained('roles')
                  ->cascadeOnDelete();

            $table->foreignId('created_by')
                  ->nullable()
                  ->after('role_id')
                  ->constrained('users')
                  ->nullOnDelete();

            $table->boolean('is_active')
                  ->default(true)
                  ->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropForeign(['role_id']);
            $table->dropForeign(['created_by']);

            $table->dropColumn(['role_id', 'created_by', 'is_active']);
        });
    }
};