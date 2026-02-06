<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory, HasUlids, SoftDeletes, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'teacher_id',
        'name',
        'description',
    ];

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    /**
     * Get the teacher that owns the course.
     *
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the classrooms assigned to this course.
     *
     * @return BelongsToMany<Classroom, $this>
     */
    public function classrooms(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class)
            ->withTimestamps();
    }

    /**
     * Get the skills in this course.
     *
     * @return HasMany<Skill, $this>
     */
    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    /**
     * Boot the model and add cascade delete for skills.
     */
    protected static function booted(): void
    {
        static::deleting(function (Course $course) {
            // Cascade soft delete to skills when course is soft deleted
            if ($course->isForceDeleting()) {
                $course->skills()->forceDelete();
            } else {
                $course->skills()->delete();
            }
        });
    }
}
