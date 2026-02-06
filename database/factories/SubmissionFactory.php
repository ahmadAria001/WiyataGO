<?php

namespace Database\Factories;

use App\Models\ParsonsProblem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
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
            'parsons_problem_id' => ParsonsProblem::factory(),
            'submitted_solution' => [0, 1, 2, 3, 4],
            'is_correct' => false,
            'xp_earned' => 0,
        ];
    }

    /**
     * Mark as correct submission.
     */
    public function correct(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => true,
            'xp_earned' => 10,
        ]);
    }

    /**
     * Mark as incorrect submission.
     */
    public function incorrect(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => false,
            'xp_earned' => 0,
        ]);
    }

    /**
     * Set a custom solution.
     *
     * @param  array<int>  $solution
     */
    public function withSolution(array $solution): static
    {
        return $this->state(fn (array $attributes) => [
            'submitted_solution' => $solution,
        ]);
    }

    /**
     * Set XP earned.
     */
    public function withXp(int $xp): static
    {
        return $this->state(fn (array $attributes) => [
            'xp_earned' => $xp,
        ]);
    }
}
