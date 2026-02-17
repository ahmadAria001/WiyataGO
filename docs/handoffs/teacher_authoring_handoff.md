# Teacher Authoring Handoff

**Date:** 2026-02-07  
**Status:** Ready for execution

---

## CONTEXT

Build Teacher Authoring features using existing Pipeline infrastructure.

**Existing:**
- DTOs: `CourseData`, `SkillData`, `ClassroomData`, `ParsonsProblemData`
- Pipes: `ValidateDataPipe`, `SanitizeDataPipe`, `AuthorizePipe`, `AuditLogPipe`
- `ModelPipelineService`

**Full Plan:**
`/home/tereza/.gemini/antigravity/brain/cd862e14-bd2b-4fad-b0a3-242c780318a5/implementation_plan.md`

---

## EXECUTION ORDER

### Module 1: Course CRUD (Start Here)
```bash
php artisan make:controller CourseController --resource
php artisan make:request StoreCourseRequest
php artisan make:request UpdateCourseRequest
php artisan make:policy CoursePolicy --model=Course
```

**Routes:**
```php
Route::resource('courses', CourseController::class)
    ->middleware('auth');
```

**Inertia Pages:**
- `pages/courses/index.tsx`
- `pages/courses/create.tsx`
- `pages/courses/edit.tsx`
- `pages/courses/show.tsx`

**Tests:**
```bash
php artisan make:test CourseControllerTest --pest
```

---

### Module 2: Skill Tree (After Course)
```bash
php artisan make:controller SkillController --resource
php artisan make:request StoreSkillRequest
php artisan make:policy SkillPolicy --model=Skill
```

**Key: DAG Cycle Prevention**
```php
// Skill.php
public function wouldCreateCycle(int $prerequisiteId): bool
{
    // BFS/DFS to detect cycles
}
```

---

### Module 3: Parsons Problems (After Skill)
```bash
php artisan make:controller ParsonsProblemController --resource
php artisan make:request StoreParsonsProblemRequest
php artisan make:policy ParsonsProblemPolicy --model=ParsonsProblem
```

**Key: JSON Validation**
```php
'blocks' => ['required', 'array'],
'blocks.*.id' => ['required', 'string'],
'blocks.*.content' => ['required', 'string'],
'solution' => ['required', 'array'],
```

---

### Module 4: Classroom (Parallel or After)
```bash
php artisan make:controller ClassroomController --resource
php artisan make:controller JoinClassroomController
php artisan make:request StoreClassroomRequest
php artisan make:policy ClassroomPolicy --model=Classroom
```

**Key: Invite Code**
```php
// Classroom.php
public function generateInviteCode(): string
{
    return Str::random(8);
}
```

---

## CONTROLLER PATTERN

```php
public function store(StoreCourseRequest $request, ModelPipelineService $pipeline)
{
    $dto = CourseData::forCreate([
        'teacher_id' => $request->user()->id,
        ...$request->validated(),
    ]);
    
    $course = $pipeline->execute($dto, [
        SanitizeDataPipe::class,
        CreateModelPipe::class,
        AuditLogPipe::class,
    ]);
    
    return redirect()->route('courses.show', $course);
}
```

---

## CHECKLIST

### Module 1
- [ ] CourseController
- [ ] StoreCourseRequest
- [ ] CoursePolicy
- [ ] 4 Inertia pages
- [ ] CourseControllerTest

### Module 2
- [ ] SkillController
- [ ] DAG validation
- [ ] Skill tree editor component
- [ ] SkillControllerTest

### Module 3
- [ ] ParsonsProblemController
- [ ] Block editor component
- [ ] ParsonsProblemControllerTest

### Module 4
- [ ] ClassroomController
- [ ] JoinClassroomController
- [ ] Invite code system
- [ ] ClassroomControllerTest

---

## TIME

| Module | Est |
|--------|-----|
| Course | 3 hrs |
| Skill | 4 hrs |
| Parsons | 4 hrs |
| Classroom | 3 hrs |
| **Total** | **14 hrs** |

---

## START

```bash
cd /home/tereza/Codes/Laravel/wiyatago
php artisan make:controller CourseController --resource
```

Good luck! 🚀
