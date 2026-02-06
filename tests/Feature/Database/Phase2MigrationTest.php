<?php

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\QueryException;

describe('Phase 2: Class Structure Migrations', function () {
    describe('classrooms table', function () {
        it('creates classroom with auto ulid', function () {
            $classroom = Classroom::factory()->create([
                'name' => 'XI RPL 1',
                'academic_year' => 2026,
            ]);

            expect($classroom->ulid)->not->toBeNull();
            expect($classroom->ulid)->toHaveLength(26);
        });

        it('generates unique ulid for each classroom', function () {
            $classroom1 = Classroom::factory()->create();
            $classroom2 = Classroom::factory()->create();

            expect($classroom1->ulid)->not->toBe($classroom2->ulid);
        });

        it('stores name correctly', function () {
            $classroom = Classroom::factory()->named('XII TKJ 2')->create();

            expect($classroom->name)->toBe('XII TKJ 2');
        });

        it('stores academic_year as integer', function () {
            $classroom = Classroom::factory()->forYear(2026)->create();

            expect($classroom->academic_year)->toBe(2026);
            expect($classroom->academic_year)->toBeInt();
        });

        it('enforces unique ulid constraint', function () {
            $classroom = Classroom::factory()->create();

            expect(fn () => Classroom::factory()->create(['ulid' => $classroom->ulid]))
                ->toThrow(QueryException::class);
        });
    });

    describe('classroom_user pivot table', function () {
        it('can attach students to classroom', function () {
            $classroom = Classroom::factory()->create();
            $student = User::factory()->create();

            $classroom->students()->attach($student);

            expect($classroom->students)->toHaveCount(1);
            expect($classroom->students->first()->id)->toBe($student->id);
        });

        it('can attach multiple students to classroom', function () {
            $classroom = Classroom::factory()->create();
            $students = User::factory()->count(3)->create();

            $classroom->students()->attach($students->pluck('id'));

            expect($classroom->students)->toHaveCount(3);
        });

        it('student can access their classrooms', function () {
            $classroom = Classroom::factory()->create();
            $student = User::factory()->create();

            $classroom->students()->attach($student);

            expect($student->classrooms)->toHaveCount(1);
            expect($student->classrooms->first()->id)->toBe($classroom->id);
        });

        it('student can be in multiple classrooms', function () {
            $student = User::factory()->create();
            $classrooms = Classroom::factory()->count(2)->create();

            foreach ($classrooms as $classroom) {
                $classroom->students()->attach($student);
            }

            expect($student->fresh()->classrooms)->toHaveCount(2);
        });

        it('prevents duplicate enrollment', function () {
            $classroom = Classroom::factory()->create();
            $student = User::factory()->create();

            $classroom->students()->attach($student);

            expect(fn () => $classroom->students()->attach($student))
                ->toThrow(QueryException::class);
        });

        it('stores timestamps on pivot', function () {
            $classroom = Classroom::factory()->create();
            $student = User::factory()->create();

            $classroom->students()->attach($student);

            $pivot = $classroom->students()->first()->pivot;

            expect($pivot->created_at)->not->toBeNull();
            expect($pivot->updated_at)->not->toBeNull();
        });
    });

    describe('cascade delete behavior', function () {
        it('removes pivot records when classroom is deleted', function () {
            $classroom = Classroom::factory()->create();
            $students = User::factory()->count(2)->create();

            $classroom->students()->attach($students->pluck('id'));
            $classroomId = $classroom->id;

            $classroom->forceDelete();

            expect(
                \DB::table('classroom_user')->where('classroom_id', $classroomId)->count()
            )->toBe(0);
        });

        it('removes pivot records when user is deleted', function () {
            $student = User::factory()->create();
            $classrooms = Classroom::factory()->count(2)->create();

            foreach ($classrooms as $classroom) {
                $classroom->students()->attach($student);
            }

            $userId = $student->id;
            $student->forceDelete();

            expect(
                \DB::table('classroom_user')->where('user_id', $userId)->count()
            )->toBe(0);
        });
    });
});
