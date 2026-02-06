# WiyataGo - Future Development Roadmap
## 🔔 REMINDER: Review this in July/August 2026

**Created:** 2026-02-03  
**Review Date:** 2026-08-01 (6 months from now)

---

## Current State (Thesis Scope)

- ✅ Open platform mode (Google Classroom style)
- ✅ Anyone can create classrooms
- ✅ is_admin flag for oversight
- ✅ No role verification needed

---

## Future Enhancement: Controlled LMS Mode

### When to Implement:
- [ ] School officially adopts the platform
- [ ] More than 50 active users
- [ ] Teacher verification becomes necessary

### What to Add:

#### 1. Platform Mode Toggle
```php
// config/wiyatago.php
'mode' => env('APP_MODE', 'open'), // 'open' | 'controlled'
```

#### 2. Teacher Verification System
```php
// Migration: add_teacher_verification_to_users
$table->boolean('is_verified_teacher')->default(false);
$table->timestamp('teacher_verified_at')->nullable();
$table->foreignId('verified_by')->nullable()->constrained('users');
```

#### 3. Admin Dashboard
- List pending teacher applications
- Approve/reject teachers
- View platform analytics
- Manage classrooms

#### 4. Platform Settings Table
```php
// Migration: create_settings_table
$table->string('key')->unique();
$table->text('value');
$table->string('type'); // string, boolean, json
```

---

## Other Future Ideas

- [ ] SSO integration with school systems
- [ ] Bulk import students via CSV
- [ ] Parent/Guardian accounts
- [ ] Multi-school support (SaaS model)
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync

---

## How to Get Reminded

1. **GitHub Issue:** Create issue with milestone "August 2026"
2. **Google Calendar:** Set event for 2026-08-01
3. **Todoist/TickTick:** Create task with due date

---

> *"The best time to plant a tree was 20 years ago. The second best time is now."*  
> *But the third best time is after you finish your thesis.*

---

**Contact future-self checklist:**
- [ ] Is thesis done?
- [ ] Is the app still being used?
- [ ] Has any school shown interest?
- [ ] Ready to implement controlled mode?
