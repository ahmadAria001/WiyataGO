<?php

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

it('adds a prerequisite between skills', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill B']);

    $response = $this->actingAs($user)->post(
        route('courses.skills.prerequisites.store', [$course, $skillB]),
        ['prerequisite_id' => $skillA->ulid]
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('skill_prerequisites', [
        'skill_id' => $skillB->id,
        'prerequisite_skill_id' => $skillA->id,
    ]);
});

it('removes a prerequisite between skills', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id]);
    $skillB = Skill::factory()->create(['course_id' => $course->id]);

    // Add prerequisite first
    $skillB->prerequisites()->attach($skillA->id);

    $response = $this->actingAs($user)->delete(
        route('courses.skills.prerequisites.destroy', [$course, $skillB, $skillA])
    );

    $response->assertRedirect();
    $this->assertDatabaseMissing('skill_prerequisites', [
        'skill_id' => $skillB->id,
        'prerequisite_skill_id' => $skillA->id,
    ]);
});

it('prevents self-referential prerequisites', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.prerequisites.store', [$course, $skill]),
        ['prerequisite_id' => $skill->ulid]
    );

    $response->assertRedirect();
    $response->assertSessionHas('message', 'A skill cannot be its own prerequisite.');
});

it('prevents duplicate prerequisites', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id]);
    $skillB = Skill::factory()->create(['course_id' => $course->id]);

    // Add prerequisite first
    $skillB->prerequisites()->attach($skillA->id);

    $response = $this->actingAs($user)->post(
        route('courses.skills.prerequisites.store', [$course, $skillB]),
        ['prerequisite_id' => $skillA->ulid]
    );

    $response->assertRedirect();
    $response->assertSessionHas('message', 'This prerequisite relationship already exists.');
});

it('denies prerequisite management to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id]);
    $skillB = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.prerequisites.store', [$course, $skillB]),
        ['prerequisite_id' => $skillA->ulid]
    );

    $response->assertForbidden();
});
