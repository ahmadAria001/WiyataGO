<?php

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it can sync skills (create, update, delete)', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    // Existing skill (to be updated)
    $existingSkill = Skill::factory()->create([
        'course_id' => $course->id,
        'name' => 'Old Name',
        'position_x' => 0,
        'position_y' => 0,
    ]);

    // Skill to be deleted (exists in DB but not in payload)
    $deletedSkill = Skill::factory()->create([
        'course_id' => $course->id,
        'name' => 'To Delete',
        'position_x' => 10,
        'position_y' => 10,
    ]);

    // New skill payload
    $payload = [
        'skills' => [
            // Update existing
            [
                'ulid' => $existingSkill->ulid,
                'name' => 'New Name',
                'description' => 'Updated Description',
                'position_x' => 100,
                'position_y' => 100,
                'difficulty' => 'advanced',
                'xp_reward' => 200,
                'remedial_material_url' => 'http://example.com',
                'prerequisites' => [],
            ],
            // Create new
            [
                'ulid' => (string) \Illuminate\Support\Str::ulid(),
                'name' => 'Brand New Skill',
                'description' => 'New Description',
                'position_x' => 500,
                'position_y' => 500,
                'difficulty' => 'beginner',
                'xp_reward' => 50,
                'remedial_material_url' => null,
                'prerequisites' => [],
            ],
        ],
    ];

    $response = $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), $payload);

    $response->assertStatus(200)
        ->assertJson(['message' => 'Skills synced successfully.']);

    // Assertions
    // 1. Update
    $this->assertDatabaseHas('skills', [
        'id' => $existingSkill->id,
        'name' => 'New Name',
        'position_x' => 100,
        'difficulty' => 'advanced',
    ]);

    // 2. Create
    $this->assertDatabaseHas('skills', [
        'name' => 'Brand New Skill',
        'position_x' => 500,
    ]);

    // 3. Delete
    $this->assertSoftDeleted('skills', [
        'id' => $deletedSkill->id,
    ]);
});

test('it can sync prerequisites', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    // Create skills with explicit positions to avoid any ambiguity
    $skillA = Skill::factory()->create([
        'course_id' => $course->id,
        'position_x' => 10,
        'position_y' => 10,
    ]);

    $skillB = Skill::factory()->create([
        'course_id' => $course->id,
        'position_x' => 100,
        'position_y' => 10,
    ]);

    // Construct simple payload with hardcoded valid integers
    $payload = [
        'skills' => [
            [
                'ulid' => $skillA->ulid,
                'name' => 'Skill A',
                'description' => 'Desc A',
                'position_x' => 10,
                'position_y' => 10,
                'difficulty' => 'beginner',
                'xp_reward' => 100,
                'remedial_material_url' => null,
                'prerequisites' => [],
            ],
            [
                'ulid' => $skillB->ulid,
                'name' => 'Skill B',
                'description' => 'Desc B',
                'position_x' => 100,
                'position_y' => 10,
                'difficulty' => 'beginner',
                'xp_reward' => 100,
                'remedial_material_url' => null,
                'prerequisites' => [
                    ['ulid' => $skillA->ulid],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), $payload);

    $response->assertStatus(200);

    // Refresh skill B to check relationships
    $skillB->refresh();

    // Assert B depends on A
    $this->assertTrue($skillB->prerequisites->contains($skillA->id));
});

test('it validates payload structure', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), ['skills' => 'not-array'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['skills']);

    $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), ['skills' => [['name' => 'Missing ULID']]])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['skills.0.ulid']);
});

test('it restores soft deleted skills when synced', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    // Create a soft-deleted skill
    $skill = Skill::factory()->create([
        'course_id' => $course->id,
        'deleted_at' => now(),
        'position_x' => 10,
        'position_y' => 10,
    ]);

    $this->assertSoftDeleted($skill);

    $payload = [
        'skills' => [
            [
                'ulid' => $skill->ulid,
                'name' => $skill->name,
                'position_x' => 20, // Change position to verify update
                'position_y' => 20,
                'difficulty' => 'beginner',
                'xp_reward' => 100,
                'remedial_material_url' => null,
                'prerequisites' => [],
            ],
        ],
    ];

    $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), $payload)
        ->assertStatus(200);

    // Should be restored (not deleted)
    $this->assertDatabaseHas('skills', [
        'id' => $skill->id,
        'position_x' => 20,
        'deleted_at' => null,
    ]);
});

test('it can sync skills with category and content', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $contentJson = [
        ['type' => 'h1', 'children' => [['text' => 'Introduction']]],
        ['type' => 'p', 'children' => [['text' => 'This is a lesson about OOP.']]],
    ];

    $payload = [
        'skills' => [
            [
                'ulid' => (string) \Illuminate\Support\Str::ulid(),
                'name' => 'OOP Basics',
                'description' => 'Learn about OOP',
                'category' => 'practice',
                'content' => $contentJson,
                'position_x' => 100,
                'position_y' => 200,
                'difficulty' => 'beginner',
                'xp_reward' => 50,
                'remedial_material_url' => null,
                'prerequisites' => [],
            ],
        ],
    ];

    $response = $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), $payload);

    $response->assertStatus(200);

    $this->assertDatabaseHas('skills', [
        'name' => 'OOP Basics',
        'category' => 'practice',
    ]);

    $skill = Skill::query()->where('name', 'OOP Basics')->first();
    expect($skill->content)->toBe($contentJson);
});

test('it rejects invalid category in sync', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['teacher_id' => $user->id]);

    $payload = [
        'skills' => [
            [
                'ulid' => (string) \Illuminate\Support\Str::ulid(),
                'name' => 'Some Skill',
                'description' => null,
                'category' => 'invalid_category',
                'position_x' => 100,
                'position_y' => 200,
                'difficulty' => 'beginner',
                'xp_reward' => 50,
                'remedial_material_url' => null,
                'prerequisites' => [],
            ],
        ],
    ];

    $this->actingAs($user)
        ->postJson(route('courses.skills.sync', $course), $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['skills.0.category']);
});
