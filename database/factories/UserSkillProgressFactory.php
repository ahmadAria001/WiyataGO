<?php

namespace Database\Factories;

use App\Models\Skill;
use App\Models\User;
use App\Models\UserSkillProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserSkillProgress>
 */
class UserSkillProgressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'skill_id' => Skill::factory(),
            'status' => UserSkillProgress::STATUS_LOCKED,
            'current_lives' => UserSkillProgress::DEFAULT_LIVES,
            'high_score' => 0,
            'cooldown_ends_at' => null,
            'lives_last_reset' => null,
        ];
    }

    /**
     * Set status to locked.
     */
    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserSkillProgress::STATUS_LOCKED,
        ]);
    }

    /**
     * Set status to unlocked.
     */
    public function unlocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserSkillProgress::STATUS_UNLOCKED,
        ]);
    }

    /**
     * Set status to mastered.
     */
    public function mastered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserSkillProgress::STATUS_MASTERED,
        ]);
    }

    /**
     * Set lives to zero and put in cooldown.
     */
    public function inCooldown(int $minutes = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'current_lives' => 0,
            'cooldown_ends_at' => now()->addMinutes($minutes),
        ]);
    }

    /**
     * Set specific lives count.
     */
    public function withLives(int $lives): static
    {
        return $this->state(fn (array $attributes) => [
            'current_lives' => $lives,
        ]);
    }

    /**
     * Set a high score.
     */
    public function withHighScore(int $score): static
    {
        return $this->state(fn (array $attributes) => [
            'high_score' => $score,
        ]);
    }
}
