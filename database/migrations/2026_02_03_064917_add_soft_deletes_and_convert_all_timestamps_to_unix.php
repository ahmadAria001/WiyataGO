<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * This migration:
 * 1. Adds deleted_at (bigint) to 5 tables: users, classrooms, courses, skills, parsons_problems
 * 2. Converts all timestamps to Unix bigint format for cross-region sync
 */
return new class extends Migration
{
    /**
     * Tables that need soft deletes (deleted_at as bigint).
     */
    private array $softDeleteTables = [
        'users',
        'classrooms',
        'courses',
        'skills',
        'parsons_problems',
    ];

    /**
     * Tables that need timestamp conversion (created_at, updated_at as bigint).
     */
    private array $timestampTables = [
        'user_activity_dates',
        'classrooms',
        'classroom_user',
        'courses',
        'classroom_course',
        'skills',
        'skill_prerequisites',
        'parsons_problems',
        'user_skill_progress',
        'submissions',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add deleted_at (bigint) to soft delete tables
        foreach ($this->softDeleteTables as $table) {
            // Skip users - already handled in previous migration
            if ($table === 'users') {
                Schema::table($table, function (Blueprint $table) {
                    $table->unsignedBigInteger('deleted_at')->nullable();
                });

                continue;
            }

            Schema::table($table, function (Blueprint $t) {
                $t->unsignedBigInteger('deleted_at')->nullable();
            });
        }

        // 2. Convert timestamps to bigint for all tables (except users which was already done)
        foreach ($this->timestampTables as $table) {
            // Drop existing timestamps
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn(['created_at', 'updated_at']);
            });

            // Add as bigint
            Schema::table($table, function (Blueprint $t) {
                $t->unsignedBigInteger('created_at')->nullable();
                $t->unsignedBigInteger('updated_at')->nullable();
            });
        }

        // 3. Convert cooldown_ends_at in user_skill_progress to bigint
        Schema::table('user_skill_progress', function (Blueprint $table) {
            $table->dropColumn('cooldown_ends_at');
        });

        Schema::table('user_skill_progress', function (Blueprint $table) {
            $table->unsignedBigInteger('cooldown_ends_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse cooldown_ends_at
        Schema::table('user_skill_progress', function (Blueprint $table) {
            $table->dropColumn('cooldown_ends_at');
        });

        Schema::table('user_skill_progress', function (Blueprint $table) {
            $table->timestamp('cooldown_ends_at')->nullable();
        });

        // Reverse timestamps back to datetime
        foreach ($this->timestampTables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn(['created_at', 'updated_at']);
            });

            Schema::table($table, function (Blueprint $t) {
                $t->timestamps();
            });
        }

        // Remove deleted_at from soft delete tables
        foreach ($this->softDeleteTables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('deleted_at');
            });
        }
    }
};
