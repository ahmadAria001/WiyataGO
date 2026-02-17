<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\Skill;
use App\Models\User;

class SkillPolicy
{
    /**
     * Determine whether the user can view any skills.
     */
    public function viewAny(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can view the skill.
     */
    public function view(User $user, Skill $skill): bool
    {
        return $user->id === $skill->course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can create skills.
     */
    public function create(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can update the skill.
     */
    public function update(User $user, Skill $skill): bool
    {
        return $user->id === $skill->course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can delete the skill.
     */
    public function delete(User $user, Skill $skill): bool
    {
        return $user->id === $skill->course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can restore the skill.
     */
    public function restore(User $user, Skill $skill): bool
    {
        return $user->id === $skill->course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can permanently delete the skill.
     */
    public function forceDelete(User $user, Skill $skill): bool
    {
        return $user->is_admin;
    }
}
