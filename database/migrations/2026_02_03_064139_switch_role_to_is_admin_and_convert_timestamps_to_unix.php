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
        Schema::table('users', function (Blueprint $table) {
            // 1. Drop the role column
            $table->dropColumn('role');

            // 2. Add is_admin boolean
            $table->boolean('is_admin')->default(false)->after('email');
        });

        // 3. Convert timestamps to bigint (separate calls for SQLite compatibility)
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('created_at')->nullable();
            $table->unsignedBigInteger('updated_at')->nullable();
        });

        // 4. Convert email_verified_at to bigint
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('email_verified_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('email_verified_at')->nullable()->after('password');
        });

        // 5. Convert two_factor_confirmed_at to bigint
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('two_factor_confirmed_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse timestamps
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at', 'email_verified_at', 'two_factor_confirmed_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamps();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
        });

        // Reverse is_admin → role
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
            $table->string('role', 20)->default('student')->after('email');
        });
    }
};
