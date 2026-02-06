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
        Schema::create('parsons_problems', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->json('blocks');
            $table->json('solution');
            $table->unsignedInteger('xp_value')->default(10);
            $table->timestamps();

            $table->index('skill_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parsons_problems');
    }
};
