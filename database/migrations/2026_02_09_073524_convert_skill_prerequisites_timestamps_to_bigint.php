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
        Schema::table('skill_prerequisites', function (Blueprint $table) {
            // Drop the datetime timestamp columns
            $table->dropColumn(['created_at', 'updated_at']);
        });

        Schema::table('skill_prerequisites', function (Blueprint $table) {
            // Add Unix bigint timestamp columns to match the project convention
            $table->unsignedBigInteger('created_at')->nullable();
            $table->unsignedBigInteger('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('skill_prerequisites', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });

        Schema::table('skill_prerequisites', function (Blueprint $table) {
            $table->timestamps();
        });
    }
};
