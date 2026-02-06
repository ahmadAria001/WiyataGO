# Auth Enhancement Handoff
## Add Role Selection to Registration

**Created by:** Thesis Planning conversation  
**Date:** 2026-02-02  
**Status:** Ready for execution

---

## CONTEXT

Add `role` field (student/teacher) to the existing Fortify registration flow.

### Key Files:
- **Plan:** `/home/tereza/.gemini/antigravity/brain/cd862e14-bd2b-4fad-b0a3-242c780318a5/auth_enhancement_plan.md`
- **Backend:** `app/Actions/Fortify/CreateNewUser.php`
- **Frontend:** `resources/js/pages/auth/register.tsx`

---

## TASKS (4 Steps, ~1 hour total)

### Step 1: Update CreateNewUser.php (10 min)

**File:** `app/Actions/Fortify/CreateNewUser.php`

**Add role validation:**
```php
Validator::make($input, [
    ...$this->profileRules(),
    'password' => $this->passwordRules(),
    'role' => ['required', 'in:student,teacher'],  // ADD THIS
])->validate();
```

**Save role:**
```php
return User::create([
    'name' => $input['name'],
    'email' => $input['email'],
    'password' => $input['password'],
    'role' => $input['role'],  // ADD THIS
]);
```

---

### Step 2: Update register.tsx (20 min)

**File:** `resources/js/pages/auth/register.tsx`

**Add role selector between Email and Password fields:**

```tsx
{/* Role Selection - Add after Email field, before Password */}
<div className="flex flex-col gap-2">
    <Label>Daftar Sebagai</Label>
    <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="radio"
                name="role"
                value="student"
                defaultChecked
                className="h-4 w-4"
            />
            <span>Siswa</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="radio"
                name="role"
                value="teacher"
                className="h-4 w-4"
            />
            <span>Guru</span>
        </label>
    </div>
    <InputError message={errors.role} />
</div>
```

---

### Step 3: Write Pest Tests (15 min)

**Create:** `tests/Feature/Auth/RegistrationRoleTest.php`

```bash
php artisan make:test Auth/RegistrationRoleTest --pest
```

```php
<?php

use App\Models\User;

it('registers user with student role', function () {
    $this->post('/register', [
        'name' => 'Test Student',
        'email' => 'student@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'student',
    ]);

    expect(User::where('email', 'student@test.com')->first()->role)->toBe('student');
});

it('registers user with teacher role', function () {
    $this->post('/register', [
        'name' => 'Test Teacher',
        'email' => 'teacher@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'teacher',
    ]);

    expect(User::where('email', 'teacher@test.com')->first()->role)->toBe('teacher');
});

it('rejects invalid role', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'email' => 'test@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ]);

    $response->assertSessionHasErrors('role');
});

it('requires role field', function () {
    $response = $this->post('/register', [
        'name' => 'Test',
        'email' => 'test@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        // missing role
    ]);

    $response->assertSessionHasErrors('role');
});
```

---

### Step 4: Run Tests & Verify

```bash
php artisan test --filter=RegistrationRoleTest
```

Then manually test:
1. Register as student
2. Register as teacher
3. Check database role column

---

## CHECKLIST

- [ ] CreateNewUser.php: Add role validation
- [ ] CreateNewUser.php: Save role to user
- [ ] register.tsx: Add role radio buttons
- [ ] Create RegistrationRoleTest.php
- [ ] Run tests: `php artisan test --filter=RegistrationRoleTest`
- [ ] Manual test: Register as student
- [ ] Manual test: Register as teacher

---

## START COMMAND

```bash
cd /home/tereza/Codes/Laravel/wiyatago
# Start with the backend change
```

Good luck! 🚀
