<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\CourseData;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use App\Pipes\AuditLogPipe;
use App\Pipes\PersistModelPipe;
use App\Pipes\SanitizeDataPipe;
use App\Services\ModelPipelineService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ModelPipelineService $pipeline,
    ) {}

    /**
     * Display a listing of courses for the current teacher.
     */
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->where('teacher_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('courses/index', [
            'courses' => $courses,
        ]);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create(): Response
    {
        return Inertia::render('courses/create');
    }

    /**
     * Store a newly created course.
     */
    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $dto = CourseData::forCreate([
            'teacher_id' => $request->user()->id,
            ...$request->validated(),
        ]);

        $course = $this->pipeline->executeWithTransaction($dto, [
            new SanitizeDataPipe,
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.show', $course);
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course): Response
    {
        $this->authorize('view', $course);

        $course->load('skills');

        return Inertia::render('courses/show', [
            'course' => $course,
        ]);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        return Inertia::render('courses/edit', [
            'course' => $course,
        ]);
    }

    /**
     * Update the specified course.
     */
    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $dto = CourseData::forUpdate($course, $request->validated());

        $this->pipeline->executeWithTransaction($dto, [
            new SanitizeDataPipe,
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.show', $course);
    }

    /**
     * Remove the specified course.
     */
    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

        $dto = CourseData::forDelete($course);

        $this->pipeline->executeWithTransaction($dto, [
            new PersistModelPipe,
            new AuditLogPipe,
        ]);

        return redirect()->route('courses.index');
    }
}
