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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parsons_problem_id')->constrained()->cascadeOnDelete();
            $table->json('submitted_solution');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('xp_earned')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'parsons_problem_id']);
            $table->index('is_correct');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
