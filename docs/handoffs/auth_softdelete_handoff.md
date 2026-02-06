# Auth Simplification + Soft Delete + Unix Timestamps Handoff

**Date:** 2026-02-03  
**Status:** Ready for execution

---

## CONTEXT

Three major changes:
1. **Auth**: Remove role, add is_admin
2. **Soft Delete**: SoftDeletes on 5 models with cascade
3. **Unix Timestamps**: All timestamps as bigint for cross-region sync

---

## UNIX TIMESTAMP STRATEGY

### Why:
- Cross-region synchronization (e.g., central government database)
- Timezone-agnostic storage
- Consistent format across all regions

### Laravel Implementation:

**Base Model Trait:**
```php
// app/Concerns/UsesUnixTimestamps.php
trait UsesUnixTimestamps
{
    public function getDateFormat(): string
    {
        return 'U'; // Unix timestamp format
    }

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
```

**Migration Style:**
```php
// Instead of $table->timestamps()
$table->unsignedBigInteger('created_at')->nullable();
$table->unsignedBigInteger('updated_at')->nullable();

// Instead of $table->softDeletes()
$table->unsignedBigInteger('deleted_at')->nullable();
```

---

## 5 PHASES (~6 hours total)

### Phase 1: Create Base Trait (15 min)
```bash
mkdir -p app/Concerns
# Create UsesUnixTimestamps trait
```

### Phase 2: Auth Migration (1 hr)
```php
// switch_role_to_is_admin_and_unix_timestamps
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('role');
    $table->boolean('is_admin')->default(false)->after('email');
    
    // Convert timestamps to Unix
    $table->dropTimestamps();
    $table->unsignedBigInteger('created_at')->nullable();
    $table->unsignedBigInteger('updated_at')->nullable();
});
```

### Phase 3: Soft Delete + Unix Migration (1.5 hr)
```php
// Add deleted_at as bigint to 5 models
Schema::table('users', fn ($t) => $t->unsignedBigInteger('deleted_at')->nullable());
// Repeat for classrooms, courses, skills, parsons_problems
```

### Phase 4: Update All Models (1 hr)
Add to each model:
```php
use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use UsesUnixTimestamps, SoftDeletes;
    
    // Override SoftDeletes to use bigint
    public function getDeletedAtColumn(): string
    {
        return 'deleted_at';
    }
}
```

### Phase 5: Frontend + Cleanup (1 hr)
- Remove role selector from register.tsx
- Run full test suite

---

## AFFECTED TABLES

| Table | created_at | updated_at | deleted_at | Other Timestamps |
|-------|------------|------------|------------|------------------|
| users | bigint | bigint | bigint | email_verified_at |
| user_activity_dates | bigint | bigint | - | - |
| classrooms | bigint | bigint | bigint | - |
| classroom_user | bigint | bigint | - | - |
| courses | bigint | bigint | bigint | - |
| classroom_course | bigint | bigint | - | - |
| skills | bigint | bigint | bigint | - |
| skill_prerequisites | bigint | bigint | - | - |
| parsons_problems | bigint | bigint | bigint | - |
| user_skill_progress | bigint | bigint | - | cooldown_ends_at |
| submissions | bigint | bigint | - | - |

---

## CHECKLIST

### Phase 1: Base Trait
- [ ] Create app/Concerns/UsesUnixTimestamps.php
- [ ] Test trait works

### Phase 2: Auth + Timestamps
- [ ] Migration: switch role, change timestamps to bigint
- [ ] User model: add trait, isAdmin()
- [ ] Test

### Phase 3: Soft Delete
- [ ] Add deleted_at (bigint) to 5 tables
- [ ] Add SoftDeletes to models
- [ ] Test

### Phase 4: Cascade
- [ ] Course::booted() cascade
- [ ] Skill::booted() cascade
- [ ] Test cascade

### Phase 5: Frontend
- [ ] register.tsx cleanup
- [ ] php artisan test --compact

---

## START

```bash
cd /home/tereza/Codes/Laravel/wiyatago
mkdir -p app/Concerns
```

---

## IMPORTANT NOTES

1. **Existing data migration**: If there's existing data, need to convert timestamps
2. **API responses**: Carbon will still work, just stored as bigint
3. **Queries**: Use `Carbon::createFromTimestamp()` for comparisons

Good luck! 🚀
