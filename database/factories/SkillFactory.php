<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Skill>
 */
class SkillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $skillNames = [
            'Class & Object',
            'Inheritance',
            'Polymorphism',
            'Encapsulation',
            'Abstraction',
            'Interface',
            'Constructor',
            'Method Overloading',
            'Method Overriding',
            'Static Members',
        ];

        return [
            'course_id' => Course::factory(),
            'name' => fake()->randomElement($skillNames),
            'description' => fake()->paragraph(),
            'remedial_material_url' => fake()->optional(0.5)->url(),
        ];
    }

    /**
     * Set a specific name for the skill.
     */
    public function named(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }

    /**
     * Set a remedial material URL.
     */
    public function withRemedialUrl(string $url): static
    {
        return $this->state(fn (array $attributes) => [
            'remedial_material_url' => $url,
        ]);
    }
}
