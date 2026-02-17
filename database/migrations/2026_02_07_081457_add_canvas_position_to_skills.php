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
        Schema::table('skills', function (Blueprint $table) {
            if (! Schema::hasColumn('skills', 'position_x')) {
                $table->integer('position_x')->default(0)->after('remedial_material_url');
            }
            if (! Schema::hasColumn('skills', 'position_y')) {
                $table->integer('position_y')->default(0)->after('position_x');
            }
            if (! Schema::hasColumn('skills', 'difficulty')) {
                $table->string('difficulty', 20)->default('beginner')->after('position_y');
            }
            if (! Schema::hasColumn('skills', 'xp_reward')) {
                $table->unsignedInteger('xp_reward')->default(100)->after('difficulty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('skills', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y', 'difficulty', 'xp_reward']);
        });
    }
};
