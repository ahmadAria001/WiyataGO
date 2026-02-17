<?php

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

/*
|--------------------------------------------------------------------------
| Builder Page
|--------------------------------------------------------------------------
*/

it('loads builder page with skills and prerequisites', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill B']);

    $skillB->prerequisites()->attach($skillA->id);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('skills/builder', false)
        ->has('skills', 2)
        ->has('course')
    );
});

it('loads builder skills with prerequisite relationships', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'Skill B']);

    $skillB->prerequisites()->attach($skillA->id);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('skills/builder', false)
        ->has('skills', 2)
        ->has('skills.1.prerequisites', 1)
    );
});

it('loads builder with empty skills when course has none', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('skills/builder', false)
        ->has('skills', 0)
    );
});

it('denies builder access to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get(route('courses.skills.builder', $course));

    $response->assertForbidden();
});

it('denies builder access to unauthenticated user', function () {
    $course = Course::factory()->create();

    $response = $this->get(route('courses.skills.builder', $course));

    $response->assertRedirect(route('login'));
});

/*
|--------------------------------------------------------------------------
| Store Builder
|--------------------------------------------------------------------------
*/

it('creates a skill via builder endpoint', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        [
            'name' => 'Builder Skill',
            'description' => 'Created from builder',
            'difficulty' => 'beginner',
            'position_x' => 100,
            'position_y' => 200,
        ]
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('skills', [
        'course_id' => $course->id,
        'name' => 'Builder Skill',
        'description' => 'Created from builder',
        'difficulty' => 'beginner',
        'position_x' => 100,
        'position_y' => 200,
    ]);
});

it('creates a skill via builder with minimal data', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        ['name' => 'Minimal Skill']
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('skills', [
        'course_id' => $course->id,
        'name' => 'Minimal Skill',
    ]);
});

it('validates builder skill creation requires name', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        ['name' => '']
    );

    $response->assertSessionHasErrors('name');
});

it('validates builder skill name max length', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        ['name' => str_repeat('a', 151)]
    );

    $response->assertSessionHasErrors('name');
});

it('validates builder skill difficulty must be valid', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        [
            'name' => 'Test Skill',
            'difficulty' => 'impossible',
        ]
    );

    $response->assertSessionHasErrors('difficulty');
});

it('validates builder skill position bounds', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        [
            'name' => 'Test Skill',
            'position_x' => -1,
            'position_y' => 10001,
        ]
    );

    $response->assertSessionHasErrors(['position_x', 'position_y']);
});

it('validates builder skill xp_reward bounds', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        [
            'name' => 'Test Skill',
            'xp_reward' => -5,
        ]
    );

    $response->assertSessionHasErrors('xp_reward');
});

it('denies builder skill creation to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->post(
        route('courses.skills.builder.store', $course),
        ['name' => 'Should Fail']
    );

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Destroy Builder
|--------------------------------------------------------------------------
*/

it('deletes a skill via builder endpoint', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->delete(
        route('courses.skills.builder.destroy', [$course, $skill])
    );

    $response->assertRedirect();
    $this->assertSoftDeleted('skills', ['id' => $skill->id]);
});

it('soft deletes a skill and preserves prerequisite records', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);
    $skillA = Skill::factory()->create(['course_id' => $course->id]);
    $skillB = Skill::factory()->create(['course_id' => $course->id]);

    $skillB->prerequisites()->attach($skillA->id);

    $response = $this->actingAs($user)->delete(
        route('courses.skills.builder.destroy', [$course, $skillA])
    );

    $response->assertRedirect();
    $this->assertSoftDeleted('skills', ['id' => $skillA->id]);
    // Skill B should still exist
    $this->assertDatabaseHas('skills', ['id' => $skillB->id]);
});

it('denies builder skill deletion to non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($user)->delete(
        route('courses.skills.builder.destroy', [$course, $skill])
    );

    $response->assertForbidden();
});

it('denies builder skill deletion to unauthenticated user', function () {
    $course = Course::factory()->create();
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->delete(
        route('courses.skills.builder.destroy', [$course, $skill])
    );

    $response->assertRedirect(route('login'));
});

it('returns 404 for nonexistent skill deletion via builder', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->delete(
        route('courses.skills.builder.destroy', [$course, 'nonexistent-ulid'])
    );

    $response->assertNotFound();
});

/*
|--------------------------------------------------------------------------
| Admin Access
|--------------------------------------------------------------------------
*/

it('allows admin to access builder for any course', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $teacher = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);

    $response = $this->actingAs($admin)->get(route('courses.skills.builder', $course));

    $response->assertOk();
});

it('allows admin to create skills via builder', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $teacher = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);

    $response = $this->actingAs($admin)->post(
        route('courses.skills.builder.store', $course),
        ['name' => 'Admin Created Skill']
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('skills', [
        'course_id' => $course->id,
        'name' => 'Admin Created Skill',
    ]);
});

it('allows admin to delete skills via builder', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $teacher = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);
    $skill = Skill::factory()->create(['course_id' => $course->id]);

    $response = $this->actingAs($admin)->delete(
        route('courses.skills.builder.destroy', [$course, $skill])
    );

    $response->assertRedirect();
    $this->assertSoftDeleted('skills', ['id' => $skill->id]);
});
