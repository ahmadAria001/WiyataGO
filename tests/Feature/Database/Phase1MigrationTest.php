<?php

use App\Models\User;
use App\Models\UserActivityDate;
use Illuminate\Database\QueryException;

describe('Phase 1: User Enhancement Migrations', function () {
    describe('users table columns', function () {
        it('adds ulid column to users', function () {
            $user = User::factory()->create();

            expect($user->ulid)->not->toBeNull();
            expect($user->ulid)->toHaveLength(26);
        });

        it('generates unique ulid for each user', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            expect($user1->ulid)->not->toBe($user2->ulid);
        });

        it('sets default is_admin to false', function () {
            $user = User::factory()->create();

            expect($user->is_admin)->toBeFalse();
            expect($user->isAdmin())->toBeFalse();
        });

        it('can create admin user', function () {
            $user = User::factory()->admin()->create();

            expect($user->is_admin)->toBeTrue();
            expect($user->isAdmin())->toBeTrue();
        });

        it('sets default total_xp to 0', function () {
            $user = User::factory()->create();

            expect($user->total_xp)->toBe(0);
        });

        it('can create user with custom xp', function () {
            $user = User::factory()->withXp(150)->create();

            expect($user->total_xp)->toBe(150);
        });
    });

    describe('user_activity_dates table', function () {
        it('can create activity date for user', function () {
            $user = User::factory()->create();
            $activityDate = UserActivityDate::factory()
                ->for($user)
                ->today()
                ->create();

            expect($activityDate->user_id)->toBe($user->id);
            expect($activityDate->activity_date->toDateString())->toBe(now()->toDateString());
        });

        it('enforces unique constraint on user_id and activity_date', function () {
            $user = User::factory()->create();
            $date = now()->toDateString();

            UserActivityDate::create([
                'user_id' => $user->id,
                'activity_date' => $date,
            ]);

            expect(fn () => UserActivityDate::create([
                'user_id' => $user->id,
                'activity_date' => $date,
            ]))->toThrow(QueryException::class);
        });

        it('allows same date for different users', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();
            $date = now()->toDateString();

            $activity1 = UserActivityDate::create([
                'user_id' => $user1->id,
                'activity_date' => $date,
            ]);

            $activity2 = UserActivityDate::create([
                'user_id' => $user2->id,
                'activity_date' => $date,
            ]);

            expect($activity1->id)->not->toBe($activity2->id);
        });

        it('allows same user for different dates', function () {
            $user = User::factory()->create();

            $activity1 = UserActivityDate::create([
                'user_id' => $user->id,
                'activity_date' => now()->toDateString(),
            ]);

            $activity2 = UserActivityDate::create([
                'user_id' => $user->id,
                'activity_date' => now()->subDay()->toDateString(),
            ]);

            expect($activity1->id)->not->toBe($activity2->id);
        });
    });

    describe('User-UserActivityDate relationship', function () {
        it('user has many activity dates', function () {
            $user = User::factory()->create();

            UserActivityDate::factory()
                ->for($user)
                ->forDate(now()->subDays(2))
                ->create();

            UserActivityDate::factory()
                ->for($user)
                ->forDate(now()->subDay())
                ->create();

            UserActivityDate::factory()
                ->for($user)
                ->today()
                ->create();

            expect($user->activityDates)->toHaveCount(3);
        });

        it('activity date belongs to user', function () {
            $user = User::factory()->create();
            $activityDate = UserActivityDate::factory()
                ->for($user)
                ->create();

            expect($activityDate->user->id)->toBe($user->id);
        });

        it('deletes activity dates when user is deleted', function () {
            $user = User::factory()->create();

            UserActivityDate::factory()
                ->for($user)
                ->count(3)
                ->create();

            expect(UserActivityDate::where('user_id', $user->id)->count())->toBe(3);

            $user->forceDelete(); // Use forceDelete since User now has SoftDeletes

            expect(UserActivityDate::where('user_id', $user->id)->count())->toBe(0);
        });
    });
});
