<?php

use App\Models\Course;
use App\Models\User;
use App\Policies\CoursePolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows any user to view any courses (viewAny)', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();

    expect($policy->viewAny($user))->toBeTrue();
});

it('allows owner to view course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    expect($policy->view($user, $course))->toBeTrue();
});

it('denies non-owner from viewing course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    expect($policy->view($user, $course))->toBeFalse();
});

it('allows admin to view any course', function () {
    $policy = new CoursePolicy;
    $admin = User::factory()->create(['is_admin' => true]);
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    expect($policy->view($admin, $course))->toBeTrue();
});

it('allows any user to create courses', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();

    expect($policy->create($user))->toBeTrue();
});

it('allows owner to update course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    expect($policy->update($user, $course))->toBeTrue();
});

it('denies non-owner from updating course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    expect($policy->update($user, $course))->toBeFalse();
});

it('allows owner to delete course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    expect($policy->delete($user, $course))->toBeTrue();
});

it('denies non-owner from deleting course', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    expect($policy->delete($user, $course))->toBeFalse();
});

it('allows admin to delete any course', function () {
    $policy = new CoursePolicy;
    $admin = User::factory()->create(['is_admin' => true]);
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $otherUser->id]);

    expect($policy->delete($admin, $course))->toBeTrue();
});

it('only allows admin to force delete', function () {
    $policy = new CoursePolicy;
    $user = User::factory()->create(['is_admin' => false]);
    $admin = User::factory()->create(['is_admin' => true]);
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    expect($policy->forceDelete($user, $course))->toBeFalse();
    expect($policy->forceDelete($admin, $course))->toBeTrue();
});
