<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grades = ['X', 'XI', 'XII'];
        $majors = ['RPL', 'TKJ', 'MM', 'AKL', 'OTKP'];

        return [
            'name' => fake()->randomElement($grades).' '.fake()->randomElement($majors).' '.fake()->numberBetween(1, 4),
            'academic_year' => fake()->numberBetween(2024, 2026),
        ];
    }

    /**
     * Set a specific academic year.
     */
    public function forYear(int $year): static
    {
        return $this->state(fn (array $attributes) => [
            'academic_year' => $year,
        ]);
    }

    /**
     * Create a classroom with a specific name.
     */
    public function named(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }
}
