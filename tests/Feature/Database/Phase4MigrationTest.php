<?php

use App\Models\ParsonsProblem;
use App\Models\Skill;
use App\Models\Submission;
use App\Models\User;
use App\Models\UserSkillProgress;
use Illuminate\Database\QueryException;

describe('Phase 4: Problems & Progress Migrations', function () {
    describe('parsons_problems table', function () {
        it('creates problem with auto ulid', function () {
            $problem = ParsonsProblem::factory()->create();

            expect($problem->ulid)->not->toBeNull();
            expect($problem->ulid)->toHaveLength(26);
        });

        it('problem belongs to skill', function () {
            $skill = Skill::factory()->create();
            $problem = ParsonsProblem::factory()->for($skill)->create();

            expect($problem->skill->id)->toBe($skill->id);
        });

        it('skill has many problems', function () {
            $skill = Skill::factory()->create();
            ParsonsProblem::factory()->count(3)->for($skill)->create();

            expect($skill->problems)->toHaveCount(3);
        });

        it('stores blocks as json array', function () {
            $blocks = ['line 1', 'line 2', 'line 3'];
            $problem = ParsonsProblem::factory()->create(['blocks' => $blocks]);

            expect($problem->blocks)->toBe($blocks);
            expect($problem->blocks)->toBeArray();
        });

        it('stores solution as json array', function () {
            $solution = [2, 0, 1];
            $problem = ParsonsProblem::factory()->create(['solution' => $solution]);

            expect($problem->solution)->toBe($solution);
        });

        it('verifies correct solution', function () {
            $problem = ParsonsProblem::factory()->create(['solution' => [0, 1, 2]]);

            expect($problem->isCorrectSolution([0, 1, 2]))->toBeTrue();
            expect($problem->isCorrectSolution([2, 1, 0]))->toBeFalse();
        });

        it('deletes problems when skill is deleted', function () {
            $skill = Skill::factory()->create();
            ParsonsProblem::factory()->count(2)->for($skill)->create();

            $skillId = $skill->id;
            $skill->forceDelete();

            expect(ParsonsProblem::where('skill_id', $skillId)->count())->toBe(0);
        });
    });

    describe('user_skill_progress table', function () {
        it('creates progress with default values', function () {
            $progress = UserSkillProgress::factory()->create();

            expect($progress->status)->toBe(UserSkillProgress::STATUS_LOCKED);
            expect($progress->current_lives)->toBe(UserSkillProgress::DEFAULT_LIVES);
            expect($progress->high_score)->toBe(0);
        });

        it('enforces unique user-skill combination', function () {
            $user = User::factory()->create();
            $skill = Skill::factory()->create();

            UserSkillProgress::factory()->create([
                'user_id' => $user->id,
                'skill_id' => $skill->id,
            ]);

            expect(fn () => UserSkillProgress::factory()->create([
                'user_id' => $user->id,
                'skill_id' => $skill->id,
            ]))->toThrow(QueryException::class);
        });

        it('user has many skill progress', function () {
            $user = User::factory()->create();
            $skills = Skill::factory()->count(3)->create();

            foreach ($skills as $skill) {
                UserSkillProgress::factory()->create([
                    'user_id' => $user->id,
                    'skill_id' => $skill->id,
                ]);
            }

            expect($user->skillProgress)->toHaveCount(3);
        });

        it('checks status helpers correctly', function () {
            $locked = UserSkillProgress::factory()->locked()->create();
            $unlocked = UserSkillProgress::factory()->unlocked()->create();
            $mastered = UserSkillProgress::factory()->mastered()->create();

            expect($locked->isLocked())->toBeTrue();
            expect($locked->isUnlocked())->toBeFalse();
            expect($unlocked->isUnlocked())->toBeTrue();
            expect($mastered->isMastered())->toBeTrue();
        });

        it('checks cooldown status', function () {
            $inCooldown = UserSkillProgress::factory()->inCooldown(30)->create();
            $notInCooldown = UserSkillProgress::factory()->create();

            expect($inCooldown->isInCooldown())->toBeTrue();
            expect($notInCooldown->isInCooldown())->toBeFalse();
        });

        it('checks has lives', function () {
            $withLives = UserSkillProgress::factory()->withLives(2)->create();
            $noLives = UserSkillProgress::factory()->withLives(0)->create();

            expect($withLives->hasLives())->toBeTrue();
            expect($noLives->hasLives())->toBeFalse();
        });
    });

    describe('submissions table', function () {
        it('creates submission with relationships', function () {
            $user = User::factory()->create();
            $problem = ParsonsProblem::factory()->create();

            $submission = Submission::factory()->create([
                'user_id' => $user->id,
                'parsons_problem_id' => $problem->id,
            ]);

            expect($submission->user->id)->toBe($user->id);
            expect($submission->problem->id)->toBe($problem->id);
        });

        it('stores submitted solution as json', function () {
            $solution = [3, 1, 2, 0];
            $submission = Submission::factory()->withSolution($solution)->create();

            expect($submission->submitted_solution)->toBe($solution);
        });

        it('tracks correct submissions', function () {
            $correct = Submission::factory()->correct()->create();
            $incorrect = Submission::factory()->incorrect()->create();

            expect($correct->is_correct)->toBeTrue();
            expect($correct->xp_earned)->toBeGreaterThan(0);
            expect($incorrect->is_correct)->toBeFalse();
            expect($incorrect->xp_earned)->toBe(0);
        });

        it('user has many submissions', function () {
            $user = User::factory()->create();
            Submission::factory()->count(5)->create(['user_id' => $user->id]);

            expect($user->submissions)->toHaveCount(5);
        });

        it('problem has many submissions', function () {
            $problem = ParsonsProblem::factory()->create();
            Submission::factory()->count(3)->create(['parsons_problem_id' => $problem->id]);

            expect($problem->submissions)->toHaveCount(3);
        });
    });

    describe('cascade delete behavior', function () {
        it('deletes progress when user is deleted', function () {
            $user = User::factory()->create();
            UserSkillProgress::factory()->count(2)->create(['user_id' => $user->id]);

            $userId = $user->id;
            $user->forceDelete();

            expect(UserSkillProgress::where('user_id', $userId)->count())->toBe(0);
        });

        it('deletes submissions when user is deleted', function () {
            $user = User::factory()->create();
            Submission::factory()->count(3)->create(['user_id' => $user->id]);

            $userId = $user->id;
            $user->forceDelete();

            expect(Submission::where('user_id', $userId)->count())->toBe(0);
        });

        it('deletes submissions when problem is deleted', function () {
            $problem = ParsonsProblem::factory()->create();
            Submission::factory()->count(2)->create(['parsons_problem_id' => $problem->id]);

            $problemId = $problem->id;
            $problem->forceDelete();

            expect(Submission::where('parsons_problem_id', $problemId)->count())->toBe(0);
        });
    });
});
