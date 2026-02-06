<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('ulid', 26)->nullable()->after('id');
            $table->string('role', 20)->default('student')->after('password');
            $table->unsignedInteger('total_xp')->default(0)->after('role');
        });

        // Generate ULIDs for existing users
        DB::table('users')->whereNull('ulid')->cursor()->each(function ($user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['ulid' => strtolower((string) Str::ulid())]);
        });

        // Now make ulid not nullable and add unique index
        // We need to recreate the column for SQLite
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, we can't alter column to NOT NULL, but we can add unique index
            Schema::table('users', function (Blueprint $table) {
                $table->unique('ulid');
            });
        } else {
            // For MySQL/MariaDB/PostgreSQL
            Schema::table('users', function (Blueprint $table) {
                $table->string('ulid', 26)->nullable(false)->unique()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['ulid']);
            $table->dropColumn(['ulid', 'role', 'total_xp']);
        });
    }
};
