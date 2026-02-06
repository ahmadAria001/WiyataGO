<?php

use App\Models\Classroom;
use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\QueryException;

describe('Phase 3: Course & Skills Migrations', function () {
    describe('courses table', function () {
        it('creates course with auto ulid', function () {
            $course = Course::factory()->create();

            expect($course->ulid)->not->toBeNull();
            expect($course->ulid)->toHaveLength(26);
        });

        it('requires teacher for course', function () {
            expect(fn () => Course::create([
                'name' => 'Test Course',
                'teacher_id' => 99999,
            ]))->toThrow(QueryException::class);
        });

        it('course belongs to teacher', function () {
            $teacher = User::factory()->admin()->create();
            $course = Course::factory()->forTeacher($teacher)->create();

            expect($course->teacher->id)->toBe($teacher->id);
            expect($course->teacher->isAdmin())->toBeTrue();
        });

        it('teacher has many courses', function () {
            $teacher = User::factory()->admin()->create();

            Course::factory()->count(3)->forTeacher($teacher)->create();

            expect($teacher->courses)->toHaveCount(3);
        });

        it('deletes courses when teacher is deleted', function () {
            $teacher = User::factory()->admin()->create();
            Course::factory()->count(2)->forTeacher($teacher)->create();

            $teacherId = $teacher->id;
            $teacher->forceDelete();

            expect(Course::where('teacher_id', $teacherId)->count())->toBe(0);
        });
    });

    describe('classroom_course pivot table', function () {
        it('can assign course to classroom', function () {
            $classroom = Classroom::factory()->create();
            $course = Course::factory()->create();

            $classroom->courses()->attach($course);

            expect($classroom->courses)->toHaveCount(1);
            expect($classroom->courses->first()->id)->toBe($course->id);
        });

        it('course can access assigned classrooms', function () {
            $course = Course::factory()->create();
            $classrooms = Classroom::factory()->count(2)->create();

            foreach ($classrooms as $classroom) {
                $classroom->courses()->attach($course);
            }

            expect($course->classrooms)->toHaveCount(2);
        });

        it('prevents duplicate assignment', function () {
            $classroom = Classroom::factory()->create();
            $course = Course::factory()->create();

            $classroom->courses()->attach($course);

            expect(fn () => $classroom->courses()->attach($course))
                ->toThrow(QueryException::class);
        });
    });

    describe('skills table', function () {
        it('creates skill with auto ulid', function () {
            $skill = Skill::factory()->create();

            expect($skill->ulid)->not->toBeNull();
            expect($skill->ulid)->toHaveLength(26);
        });

        it('skill belongs to course', function () {
            $course = Course::factory()->create();
            $skill = Skill::factory()->for($course)->create();

            expect($skill->course->id)->toBe($course->id);
        });

        it('course has many skills', function () {
            $course = Course::factory()->create();
            Skill::factory()->count(3)->for($course)->create();

            expect($course->skills)->toHaveCount(3);
        });

        it('stores remedial material url', function () {
            $skill = Skill::factory()
                ->withRemedialUrl('https://example.com/remedial')
                ->create();

            expect($skill->remedial_material_url)->toBe('https://example.com/remedial');
        });

        it('deletes skills when course is deleted', function () {
            $course = Course::factory()->create();
            Skill::factory()->count(2)->for($course)->create();

            $courseId = $course->id;
            $course->forceDelete();

            expect(Skill::where('course_id', $courseId)->count())->toBe(0);
        });
    });

    describe('skill_prerequisites (DAG)', function () {
        it('can create skill prerequisites', function () {
            $course = Course::factory()->create();
            $classSkill = Skill::factory()->for($course)->named('Class')->create();
            $objectSkill = Skill::factory()->for($course)->named('Object')->create();

            $objectSkill->prerequisites()->attach($classSkill);

            expect($objectSkill->prerequisites)->toHaveCount(1);
            expect($objectSkill->prerequisites->first()->name)->toBe('Class');
        });

        it('skill can have multiple prerequisites', function () {
            $course = Course::factory()->create();
            $classSkill = Skill::factory()->for($course)->named('Class')->create();
            $objectSkill = Skill::factory()->for($course)->named('Object')->create();
            $inheritanceSkill = Skill::factory()->for($course)->named('Inheritance')->create();

            // Inheritance requires both Class and Object
            $inheritanceSkill->prerequisites()->attach([$classSkill->id, $objectSkill->id]);

            expect($inheritanceSkill->prerequisites)->toHaveCount(2);
        });

        it('skill can be prerequisite for multiple skills', function () {
            $course = Course::factory()->create();
            $classSkill = Skill::factory()->for($course)->named('Class')->create();
            $objectSkill = Skill::factory()->for($course)->named('Object')->create();
            $inheritanceSkill = Skill::factory()->for($course)->named('Inheritance')->create();

            // Both Object and Inheritance depend on Class
            $objectSkill->prerequisites()->attach($classSkill);
            $inheritanceSkill->prerequisites()->attach($classSkill);

            expect($classSkill->dependents)->toHaveCount(2);
        });

        it('prevents duplicate prerequisite', function () {
            $course = Course::factory()->create();
            $classSkill = Skill::factory()->for($course)->create();
            $objectSkill = Skill::factory()->for($course)->create();

            $objectSkill->prerequisites()->attach($classSkill);

            expect(fn () => $objectSkill->prerequisites()->attach($classSkill))
                ->toThrow(QueryException::class);
        });

        it('checks if prerequisites are met', function () {
            $course = Course::factory()->create();
            $classSkill = Skill::factory()->for($course)->create();
            $objectSkill = Skill::factory()->for($course)->create();
            $inheritanceSkill = Skill::factory()->for($course)->create();

            // Inheritance requires Class and Object
            $inheritanceSkill->prerequisites()->attach([$classSkill->id, $objectSkill->id]);

            // No skills mastered
            expect($inheritanceSkill->hasPrerequisitesMet([]))->toBeFalse();

            // Only Class mastered
            expect($inheritanceSkill->hasPrerequisitesMet([$classSkill->id]))->toBeFalse();

            // Both mastered
            expect($inheritanceSkill->hasPrerequisitesMet([$classSkill->id, $objectSkill->id]))->toBeTrue();
        });

        it('skill with no prerequisites always has prerequisites met', function () {
            $skill = Skill::factory()->create();

            expect($skill->hasPrerequisitesMet([]))->toBeTrue();
        });
    });
});
