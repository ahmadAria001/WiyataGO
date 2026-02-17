<?php

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

it('lists skills for a course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skills = Skill::factory()->count(3)->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->get(route('courses.skills.index', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('skills/index', false) // Skip page existence check
        ->has('skills', 3)
    );
});

it('shows skill builder for course owner', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('skills/builder', false)); // Skip page existence check
});

it('denies builder access to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertForbidden();
});

it('creates a skill', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('courses.skills.store', $course), [
        'name' => 'Test Skill',
        'description' => 'A test skill description',
        'difficulty' => 'intermediate',
        'xp_reward' => 150,
    ]);

    $response->assertRedirect(route('courses.skills.index', $course));
    $this->assertDatabaseHas('skills', [
        'course_id' => $course->id,
        'name' => 'Test Skill',
        'difficulty' => 'intermediate',
        'xp_reward' => 150,
    ]);
});

it('validates skill creation', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('courses.skills.store', $course), [
        'name' => '', // Required
    ]);

    $response->assertSessionHasErrors('name');
});

it('updates a skill', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->put(route('courses.skills.update', [$course, $skill]), [
        'name' => 'Updated Skill',
        'difficulty' => 'advanced',
    ]);

    $response->assertRedirect(route('courses.skills.index', $course));
    $this->assertDatabaseHas('skills', [
        'id' => $skill->id,
        'name' => 'Updated Skill',
        'difficulty' => 'advanced',
    ]);
});

it('updates skill position', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skill = Skill::factory()->create([
        'course_id' => $course->id,
        'position_x' => 0,
        'position_y' => 0,
    ]);

    $response = $this->actingAs($user)->patch(route('courses.skills.position', [$course, $skill]), [
        'position_x' => 250,
        'position_y' => 150,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('skills', [
        'id' => $skill->id,
        'position_x' => 250,
        'position_y' => 150,
    ]);
});

it('deletes a skill', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->delete(route('courses.skills.destroy', [$course, $skill]));

    $response->assertRedirect(route('courses.skills.index', $course));
    $this->assertSoftDeleted('skills', ['id' => $skill->id]);
});

it('denies skill creation to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->post(route('courses.skills.store', $course), [
        'name' => 'Test Skill',
    ]);

    $response->assertForbidden();
});
