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
        Schema::create('user_skill_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('locked'); // locked, unlocked, mastered
            $table->unsignedTinyInteger('current_lives')->default(3);
            $table->unsignedInteger('high_score')->default(0);
            $table->timestamp('cooldown_ends_at')->nullable();
            $table->date('lives_last_reset')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'skill_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_skill_progress');
    }
};
