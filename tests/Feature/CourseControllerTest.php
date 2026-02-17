<?php

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

it('shows course index for authenticated user', function () {
    $user = User::factory()->create();
    $courses = Course::factory()->count(3)->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('courses.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('courses/index')
        ->has('courses', 3)
    );
});

it('shows only own courses in index', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Course::factory()->count(2)->create(['teacher_id' => $user->id]);
    Course::factory()->count(3)->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get(route('courses.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('courses', 2)
    );
});

it('shows create course form', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('courses.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('courses/create')
    );
});

it('creates a course', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('courses.store'), [
        'name' => 'Test Course',
        'description' => 'A test course description',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('courses', [
        'name' => 'Test Course',
        'description' => 'A test course description',
        'teacher_id' => $user->id,
    ]);
});

it('validates course creation', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('courses.store'), [
        'name' => '', // Required
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('shows course detail for owner', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('courses.show', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('courses/show')
        ->has('course')
        ->where('course.ulid', $course->ulid)
    );
});

it('denies course detail for non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get(route('courses.show', $course));

    $response->assertForbidden();
});

it('shows edit form for owner', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('courses.edit', $course));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('courses/edit')
        ->has('course')
    );
});

it('updates a course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->put(route('courses.update', $course), [
        'name' => 'Updated Name',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('courses', [
        'id' => $course->id,
        'name' => 'Updated Name',
        'description' => 'Updated description',
    ]);
});

it('denies update for non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->put(route('courses.update', $course), [
        'name' => 'Hacked Name',
    ]);

    $response->assertForbidden();
});

it('deletes a course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $response = $this->actingAs($user)->delete(route('courses.destroy', $course));

    $response->assertRedirect(route('courses.index'));
    $this->assertSoftDeleted('courses', ['id' => $course->id]);
});

it('denies delete for non-owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    $response = $this->actingAs($user)->delete(route('courses.destroy', $course));

    $response->assertForbidden();
});

it('allows admin to view any course', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $teacher = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);

    $response = $this->actingAs($admin)->get(route('courses.show', $course));

    $response->assertOk();
});

it('allows admin to delete any course', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $teacher = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);

    $response = $this->actingAs($admin)->delete(route('courses.destroy', $course));

    $response->assertRedirect(route('courses.index'));
    $this->assertSoftDeleted('courses', ['id' => $course->id]);
});
