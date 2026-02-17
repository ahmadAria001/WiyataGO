<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replace the plain unique index on users.email with a conditional unique index
 * that only enforces uniqueness for active (non-soft-deleted) records.
 *
 * MariaDB doesn't support functional indexes directly, so we use a VIRTUAL
 * generated column that evaluates to the email when deleted_at IS NULL,
 * and NULL otherwise. Since unique indexes allow multiple NULLs, soft-deleted
 * records won't conflict with active ones.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support generated columns in ALTER TABLE.
            // The plain unique index is kept as-is for test environments.
            return;
        }

        // 1. Drop the existing plain unique index on email
        DB::statement('ALTER TABLE users DROP INDEX users_email_unique');

        // 2. Add a virtual generated column that only holds email for active records
        DB::statement(<<<'SQL'
            ALTER TABLE users
            ADD COLUMN email_active VARCHAR(255)
            GENERATED ALWAYS AS (IF(deleted_at IS NULL, email, NULL)) VIRTUAL
        SQL);

        // 3. Add unique index on the virtual column
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email_active)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // 1. Drop the conditional unique index
        DB::statement('DROP INDEX users_email_unique ON users');

        // 2. Remove the virtual column
        DB::statement('ALTER TABLE users DROP COLUMN email_active');

        // 3. Restore the original plain unique index
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
    }
};
