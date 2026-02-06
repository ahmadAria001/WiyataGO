<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ParsonsProblem>
 */
class ParsonsProblemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'skill_id' => Skill::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'blocks' => [
                'public class Hello {',
                '    public static void main(String[] args) {',
                '        System.out.println("Hello!");',
                '    }',
                '}',
            ],
            'solution' => [0, 1, 2, 3, 4],
            'xp_value' => fake()->randomElement([10, 15, 20, 25]),
        ];
    }

    /**
     * Set custom blocks and solution.
     *
     * @param  array<int, string>  $blocks
     * @param  array<int>  $solution
     */
    public function withProblem(array $blocks, array $solution): static
    {
        return $this->state(fn (array $attributes) => [
            'blocks' => $blocks,
            'solution' => $solution,
        ]);
    }

    /**
     * Set a specific XP value.
     */
    public function withXp(int $xp): static
    {
        return $this->state(fn (array $attributes) => [
            'xp_value' => $xp,
        ]);
    }
}
