<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\SkillData;
use App\Enums\SkillCategory;
use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Http\Utils;
use App\Models\Course;
use App\Models\Skill;
use App\Pipes\AuditLogPipe;
use App\Pipes\PersistModelPipe;
use App\Pipes\SanitizeDataPipe;
use App\Services\ModelPipelineService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ModelPipelineService $pipeline,
    ) {}

    /**
     * Display a listing of skills for a course.
     */
    public function index(Course $course): Response
    {
        $this->authorize('view', $course);

        $skills = $course->skills()
            ->with('prerequisites:id,name')
            ->get();

        return Inertia::render('skills/index', [
            'course' => $course,
            'skills' => $skills,
        ]);
    }

    /**
     * Show the form for creating a new skill.
     */
    public function create(Course $course): Response
    {
        $this->authorize('update', $course);

        return Inertia::render('skills/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created skill.
     */
    public function store(StoreSkillRequest $request, Course $course): JsonResponse|RedirectResponse
    {
        $dto = SkillData::forCreate([
            'course_id' => $course->id,
            ...$request->validated(),
        ]);

        $skill = $this->pipeline->executeWithTransaction($dto, [
            new SanitizeDataPipe,
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.skills.index', $course)
            ->with('success', 'Skill created successfully.');
    }

    /**
     * Display the specified skill.
     */
    public function show(Course $course, Skill $skill): Response
    {
        $this->authorize('view', $course);

        $skill->load('prerequisites:id,name', 'dependents:id,name');

        return Inertia::render('skills/show', [
            'course' => $course,
            'skill' => $skill,
        ]);
    }

    /**
     * Show the form for editing the specified skill.
     */
    public function edit(Course $course, Skill $skill): Response
    {
        $this->authorize('update', $course);

        $skill->load('prerequisites:id,name');

        return Inertia::render('skills/edit', [
            'course' => $course,
            'skill' => $skill,
        ]);
    }

    /**
     * Update the specified skill.
     */
    public function update(UpdateSkillRequest $request, Course $course, Skill $skill): RedirectResponse
    {
        $dto = SkillData::forUpdate($skill, $request->validated());

        $this->pipeline->executeWithTransaction($dto, [
            new SanitizeDataPipe,
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.skills.index', $course)
            ->with('success', 'Skill updated successfully.');
    }

    /**
     * Update only the position of a skill (for canvas drag).
     */
    public function updatePosition(Course $course, Skill $skill): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = request()->validate([
            'position_x' => ['required', 'integer'],
            'position_y' => ['required', 'integer'],
        ]);

        $dto = SkillData::forUpdate($skill, $validated);

        $this->pipeline->executeWithTransaction($dto, [
            new PersistModelPipe,
        ]);

        return Utils::determinReturnMethod(200, [
            'message' => 'Position updated successfully.',
        ]);
    }

    /**
     * Remove the specified skill.
     */
    public function destroy(Course $course, Skill $skill): RedirectResponse
    {
        $this->authorize('update', $course);

        $dto = SkillData::forDelete($skill);

        $this->pipeline->executeWithTransaction($dto, [
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.skills.index', $course)
            ->with('success', 'Skill deleted successfully.');
    }

    /**
     * Show the skill tree builder page.
     */
    public function builder(Course $course): Response
    {
        $this->authorize('update', $course);

        $skills = Inertia::always($course->skills()
            ->with('prerequisites:ulid,name,position_x,position_y')
            ->get());

        return Inertia::render('skills/builder', [
            'course' => $course,
            'skills' => $skills,
        ]);
    }

    /**
     * Store a newly created skill from builder.
     */
    public function storeBuilder(StoreSkillRequest $request, Course $course): JsonResponse|RedirectResponse
    {
        $dto = SkillData::forCreate([
            'course_id' => $course->id,
            ...$request->validated(),
        ]);

        $skill = $this->pipeline->executeWithTransaction($dto, [
            new SanitizeDataPipe,
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return Utils::determinReturnMethod(200, [
            'message' => 'Skill created successfully.',
        ]);
    }

    /**
     * Remove the specified skill from builder.
     */
    public function destroyBuilder(Course $course, Skill $skill): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $course);

        $dto = SkillData::forDelete($skill);

        $this->pipeline->executeWithTransaction($dto, [
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return Utils::determinReturnMethod(200, [
            'message' => 'Skill deleted successfully.',
        ]);
    }

    /**
     * Sync full skill state from client (for Undo/Redo).
     */
    public function sync(\Illuminate\Http\Request $request, Course $course): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'skills' => ['required', 'array'],
            'skills.*.ulid' => ['required', 'string'],
            'skills.*.name' => ['required', 'string', 'max:255'],
            'skills.*.position_x' => ['required', 'integer'],
            'skills.*.position_y' => ['required', 'integer'],
            'skills.*.description' => ['nullable', 'string'],
            'skills.*.category' => ['nullable', Rule::enum(SkillCategory::class)],
            'skills.*.content' => ['nullable', 'array'],
            'skills.*.difficulty' => ['required', 'in:beginner,intermediate,advanced'],
            'skills.*.xp_reward' => ['required', 'integer', 'min:0'],
            'skills.*.remedial_material_url' => ['nullable', 'string'],
            'skills.*.prerequisites' => ['nullable', 'array'],
            'skills.*.prerequisites.*.ulid' => ['required', 'string'],
        ]);

        $clientSkills = collect($validated['skills']);
        $clientSkillIds = $clientSkills->pluck('ulid')->toArray();

        \DB::transaction(function () use ($course, $clientSkills, $clientSkillIds) {
            // 1. Delete skills not present in the payload (Using Pipeline)
            $skillsToDelete = $course->skills()->whereNotIn('ulid', $clientSkillIds)->get();

            foreach ($skillsToDelete as $skillToDelete) {
                // Ensure we use the specialized DTO for delete
                $dto = SkillData::forDelete($skillToDelete);

                // Execute pipeline (AuditLog + Persist)
                $this->pipeline->execute($dto, [
                    PersistModelPipe::class,
                    AuditLogPipe::class,
                ]);
            }

            // 2. Upsert skills (Using Pipeline)
            foreach ($clientSkills as $skillData) {
                $skill = Skill::withTrashed()->where('ulid', $skillData['ulid'])
                    ->where('course_id', $course->id)
                    ->first();

                // Handle restoration explicitly before pipeline
                if ($skill && $skill->trashed()) {
                    $skill->restore();
                }

                $attributes = [
                    'name' => $skillData['name'],
                    'description' => $skillData['description'] ?? '',
                    'category' => $skillData['category'] ?? 'theory',
                    'content' => $skillData['content'] ?? null,
                    'position_x' => $skillData['position_x'],
                    'position_y' => $skillData['position_y'],
                    'difficulty' => $skillData['difficulty'],
                    'xp_reward' => (int) $skillData['xp_reward'],
                    'remedial_material_url' => $skillData['remedial_material_url'] ?? null,
                ];

                if ($skill) {
                    $dto = SkillData::forUpdate($skill, $attributes);
                } else {
                    // For new skills, we manually instantiate so we can force the ULID
                    // which might not be mass-assignable via the DTO's fillable data.
                    $skill = new Skill;
                    $skill->ulid = $skillData['ulid'];
                    $skill->course_id = $course->id;

                    $dto = SkillData::forCreate($attributes);
                    $dto->setModel($skill);
                }

                $this->pipeline->execute($dto, [
                    SanitizeDataPipe::class,
                    PersistModelPipe::class,
                    AuditLogPipe::class,
                ]);
            }

            // 3. Sync prerequisites
            foreach ($clientSkills as $skillData) {
                if (isset($skillData['prerequisites'])) {
                    $skill = Skill::withTrashed()->where('ulid', $skillData['ulid'])->first();

                    if ($skill) {
                        $prereqUlids = collect($skillData['prerequisites'])->pluck('ulid');
                        $prereqIds = Skill::withTrashed()->whereIn('ulid', $prereqUlids)->pluck('id');
                        $skill->prerequisites()->sync($prereqIds);
                    }
                }
            }
        });

        return Utils::determinReturnMethod(200, [
            'message' => 'Skills synced successfully.',
        ]);
    }
}
