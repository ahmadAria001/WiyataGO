<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserActivityDate>
 */
class UserActivityDateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $dayOffset = 0;

        return [
            'user_id' => User::factory(),
            'activity_date' => now()->subDays($dayOffset++)->format('Y-m-d'),
        ];
    }

    /**
     * Set a specific activity date.
     */
    public function forDate(\DateTimeInterface|string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_date' => $date instanceof \DateTimeInterface ? $date->format('Y-m-d') : $date,
        ]);
    }

    /**
     * Set activity date to today.
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_date' => now()->format('Y-m-d'),
        ]);
    }
}
