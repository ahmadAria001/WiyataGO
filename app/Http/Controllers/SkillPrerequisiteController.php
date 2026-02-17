<?php

namespace App\Http\Controllers;

use App\Http\Utils;
use App\Models\Course;
use App\Models\Skill;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SkillPrerequisiteController extends Controller
{
    use AuthorizesRequests;

    /**
     * Add a prerequisite relationship between two skills.
     */
    public function store(Request $request, Course $course, Skill $skill): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'prerequisite_id' => ['required', 'exists:skills,ulid'],
        ]);

        $prerequisiteId = $validated['prerequisite_id'];

        // Ensure prerequisite belongs to the same course
        $prerequisite = Skill::where('ulid', $prerequisiteId)
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Prevent self-referential prerequisite
        if ($skill->id === $prerequisite->id) {
            return Utils::determinReturnMethod(422, [
                'message' => 'A skill cannot be its own prerequisite.',
            ]);
        }

        // Check for DAG cycle
        if ($skill->wouldCreateCycle($prerequisite->id)) {
            return Utils::determinReturnMethod(422, [
                'message' => 'Adding this prerequisite would create a circular dependency.',
            ]);
        }

        // Check if already exists
        if ($skill->prerequisites()->where('prerequisite_skill_id', $prerequisite->id)->exists()) {
            return Utils::determinReturnMethod(422, [
                'message' => 'This prerequisite relationship already exists.',
            ]);
        }

        $skill->prerequisites()->attach($prerequisite->id);

        return Utils::determinReturnMethod(200, ['message' => 'Prerequisite added successfully.']);
    }

    /**
     * Remove a prerequisite relationship between two skills.
     */
    public function destroy(Course $course, Skill $skill, Skill $prerequisite): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure both skills belong to the course
        if ($skill->course_id !== $course->id || $prerequisite->course_id !== $course->id) {
            abort(404);
        }

        $skill->prerequisites()->detach($prerequisite->id);

        return Utils::determinReturnMethod(200, [
            'message' => 'Prerequisite removed successfully.',
        ]);
    }
}
