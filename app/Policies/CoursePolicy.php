<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can view any courses.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the course.
     */
    public function view(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can create courses.
     */
    public function create(User $user): bool
    {
        return true; // Any authenticated user can create courses
    }

    /**
     * Determine whether the user can update the course.
     */
    public function update(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can delete the course.
     */
    public function delete(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can restore the course.
     */
    public function restore(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id || $user->is_admin;
    }

    /**
     * Determine whether the user can permanently delete the course.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return $user->is_admin;
    }
}
