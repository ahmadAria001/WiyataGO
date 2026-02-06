# Database Migration Handoff
## For: Conversation "Refactor Login Page UI"

**Created by:** Thesis Planning conversation  
**Date:** 2026-02-02  
**Status:** Ready for execution

---

## CONTEXT

You're picking up the **database migration implementation** for the WiyataGo e-learning project.

### Key Files:
- **ERD:** `/home/tereza/Codes/Laravel/wiyatago/diagrams/erd.md`
- **Full Plan:** `/home/tereza/.gemini/antigravity/brain/cd862e14-bd2b-4fad-b0a3-242c780318a5/migration_implementation_plan.md`

### Database Targets:
- SQLite (development)
- MariaDB/MySQL (production)
- PostgreSQL (optional)

---

## YOUR TASK

Create **11 migrations** in **4 phases**, with **Pest tests** for each.

### Phase 1: User Enhancement (Do First)
```bash
php artisan make:migration add_app_columns_to_users_table --table=users
php artisan make:migration create_user_activity_dates_table
```

**Columns to add to users:**
- `ulid` (unique)
- `role` (string, default: 'student')
- `total_xp` (unsignedInteger, default: 0)

**user_activity_dates table:**
- `id`, `user_id` (FK), `activity_date`, unique constraint on [user_id, activity_date]

**Then create test:**
```bash
php artisan make:test Database/Phase1MigrationTest --pest
```

---

### Phase 2: Class Structure
```bash
php artisan make:migration create_classrooms_table
php artisan make:migration create_classroom_user_table
```

---

### Phase 3: Course & Skills
```bash
php artisan make:migration create_courses_table
php artisan make:migration create_classroom_course_table
php artisan make:migration create_skills_table
php artisan make:migration create_skill_prerequisites_table
```

---

### Phase 4: Problems & Progress
```bash
php artisan make:migration create_parsons_problems_table
php artisan make:migration create_user_skill_progress_table
php artisan make:migration create_submissions_table
```

---

## IMPORTANT RULES

1. **Use `string` NOT `enum`** - SQLite doesn't support enum
2. **Use `$table->ulid()`** - Laravel 12 native
3. **Use `$table->json()`** - For blocks and solution columns
4. **Write Pest tests** for each phase before moving to next
5. **Run `php artisan migrate`** after each phase to verify

---

## ESTIMATED TIME

| Phase | Time |
|-------|------|
| Phase 1 | 1-2 hrs |
| Phase 2 | 1-2 hrs |
| Phase 3 | 2-3 hrs |
| Phase 4 | 2-3 hrs |
| **Total** | **6-8 hrs** |

---

## REFERENCE

See the full migration code in:
`/home/tereza/.gemini/antigravity/brain/cd862e14-bd2b-4fad-b0a3-242c780318a5/migration_implementation_plan.md`

That document has **complete PHP code** for all 11 migrations and sample Pest tests.

---

## START COMMAND

Begin with:
```bash
cd /home/tereza/Codes/Laravel/wiyatago
php artisan make:migration add_app_columns_to_users_table --table=users
```

Good luck! 🚀
