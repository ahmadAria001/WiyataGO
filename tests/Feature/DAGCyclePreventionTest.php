<?php

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('detects direct cycle A->B->A', function () {
    $course = Course::factory()->create();

    // Create skills A and B
    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);

    // B requires A (A -> B)
    $skillB->prerequisites()->attach($skillA->id);

    // Now if we try to make A require B (B -> A), it would create a cycle
    expect($skillA->wouldCreateCycle($skillB->id))->toBeTrue();
});

it('detects indirect cycle A->B->C->A', function () {
    $course = Course::factory()->create();

    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);
    $skillC = Skill::factory()->create(['course_id' => $course->id, 'name' => 'C']);

    // B requires A (A -> B)
    $skillB->prerequisites()->attach($skillA->id);
    // C requires B (B -> C)
    $skillC->prerequisites()->attach($skillB->id);

    // Now if we try to make A require C (C -> A), it would create a cycle
    expect($skillA->wouldCreateCycle($skillC->id))->toBeTrue();
});

it('allows valid DAG without cycles', function () {
    $course = Course::factory()->create();

    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);
    $skillC = Skill::factory()->create(['course_id' => $course->id, 'name' => 'C']);

    // A -> B, A -> C (valid DAG)
    $skillB->prerequisites()->attach($skillA->id);
    $skillC->prerequisites()->attach($skillA->id);

    // C requiring B should be valid (no cycle)
    expect($skillC->wouldCreateCycle($skillB->id))->toBeFalse();
});

it('allows unrelated skills to be connected', function () {
    $course = Course::factory()->create();

    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);

    // No prerequisites, should allow connection either way
    expect($skillA->wouldCreateCycle($skillB->id))->toBeFalse();
    expect($skillB->wouldCreateCycle($skillA->id))->toBeFalse();
});

it('rejects cycle creation via API', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);

    // B requires A
    $skillB->prerequisites()->attach($skillA->id);

    // Try to make A require B via API (should fail)
    $response = $this->actingAs($user)->postJson(
        route('courses.skills.prerequisites.store', [$course, $skillA]),
        ['prerequisite_id' => $skillB->id]
    );

    $response->assertStatus(422);
    $response->assertJson(['message' => 'Adding this prerequisite would create a circular dependency.']);
});

it('handles diamond dependencies correctly', function () {
    $course = Course::factory()->create();

    //     A
    //    / \
    //   B   C
    //    \ /
    //     D
    $skillA = Skill::factory()->create(['course_id' => $course->id, 'name' => 'A']);
    $skillB = Skill::factory()->create(['course_id' => $course->id, 'name' => 'B']);
    $skillC = Skill::factory()->create(['course_id' => $course->id, 'name' => 'C']);
    $skillD = Skill::factory()->create(['course_id' => $course->id, 'name' => 'D']);

    // Set up diamond: B->A, C->A, D->B, D->C
    $skillB->prerequisites()->attach($skillA->id);
    $skillC->prerequisites()->attach($skillA->id);
    $skillD->prerequisites()->attach($skillB->id);
    $skillD->prerequisites()->attach($skillC->id);

    // Adding A->D would create a cycle
    expect($skillA->wouldCreateCycle($skillD->id))->toBeTrue();

    // But D can still reference A directly (redundant but valid)
    expect($skillD->wouldCreateCycle($skillA->id))->toBeFalse();
});
