<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    if (DB::getDriverName() === 'sqlite') {
        $this->markTestSkipped('Conditional unique index uses MariaDB virtual columns, not supported on SQLite.');
    }
});

it('allows new user with same email after original is soft-deleted', function () {
    $original = User::factory()->create(['email' => 'test@example.com']);

    $original->delete(); // soft delete

    $newUser = User::factory()->create(['email' => 'test@example.com']);

    expect($newUser->email)->toBe('test@example.com');
    $this->assertSoftDeleted('users', ['id' => $original->id]);
    $this->assertDatabaseHas('users', ['id' => $newUser->id, 'deleted_at' => null]);
});

it('prevents duplicate email for active users', function () {
    User::factory()->create(['email' => 'test@example.com']);

    User::factory()->create(['email' => 'test@example.com']);
})->throws(\Illuminate\Database\QueryException::class);

it('allows multiple soft-deleted users with same email', function () {
    $first = User::factory()->create(['email' => 'test@example.com']);
    $first->delete();

    $second = User::factory()->create(['email' => 'test@example.com']);
    $second->delete();

    $third = User::factory()->create(['email' => 'test@example.com']);
    $third->delete();

    expect(User::withTrashed()->where('email', 'test@example.com')->count())->toBe(3);
});

it('allows one active user alongside soft-deleted users with same email', function () {
    $deleted1 = User::factory()->create(['email' => 'test@example.com']);
    $deleted1->delete();

    $deleted2 = User::factory()->create(['email' => 'test@example.com']);
    $deleted2->delete();

    $active = User::factory()->create(['email' => 'test@example.com']);

    expect(User::where('email', 'test@example.com')->count())->toBe(1);
    expect(User::withTrashed()->where('email', 'test@example.com')->count())->toBe(3);
    expect($active->trashed())->toBeFalse();
});

it('prevents second active user after restoring soft-deleted user with same email', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);
    $user->delete();

    User::factory()->create(['email' => 'test@example.com']);

    // Restoring the original should fail because the email is now taken by an active user
    $user->restore();
})->throws(\Illuminate\Database\QueryException::class);
