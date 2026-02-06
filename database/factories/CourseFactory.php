<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $courseNames = [
            'Pemrograman Berorientasi Objek',
            'Basis Data',
            'Pemrograman Web',
            'Algoritma dan Struktur Data',
            'Jaringan Komputer',
            'Sistem Operasi',
            'Mobile Programming',
            'Desain Grafis',
        ];

        return [
            'teacher_id' => User::factory()->admin(),
            'name' => fake()->randomElement($courseNames),
            'description' => fake()->paragraph(),
        ];
    }

    /**
     * Set a specific name for the course.
     */
    public function named(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }

    /**
     * Set a specific teacher for the course.
     */
    public function forTeacher(User $teacher): static
    {
        return $this->state(fn (array $attributes) => [
            'teacher_id' => $teacher->id,
        ]);
    }
}
