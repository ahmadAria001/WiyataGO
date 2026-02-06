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

class Skill extends Model
{
    /** @use HasFactory<\Database\Factories\SkillFactory> */
    use HasFactory, HasUlids, SoftDeletes, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'course_id',
        'name',
        'description',
        'remedial_material_url',
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
     * Get the course that owns the skill.
     *
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the prerequisite skills for this skill.
     *
     * @return BelongsToMany<Skill, $this>
     */
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            Skill::class,
            'skill_prerequisites',
            'skill_id',
            'prerequisite_skill_id'
        )->withTimestamps();
    }

    /**
     * Get the skills that depend on this skill.
     *
     * @return BelongsToMany<Skill, $this>
     */
    public function dependents(): BelongsToMany
    {
        return $this->belongsToMany(
            Skill::class,
            'skill_prerequisites',
            'prerequisite_skill_id',
            'skill_id'
        )->withTimestamps();
    }

    /**
     * Check if this skill has all prerequisites met.
     *
     * @param  array<int>  $masteredSkillIds
     */
    public function hasPrerequisitesMet(array $masteredSkillIds): bool
    {
        $prerequisiteIds = $this->prerequisites()->pluck('skills.id')->toArray();

        if (empty($prerequisiteIds)) {
            return true;
        }

        return empty(array_diff($prerequisiteIds, $masteredSkillIds));
    }

    /**
     * Get the Parsons problems for this skill.
     *
     * @return HasMany<ParsonsProblem, $this>
     */
    public function problems(): HasMany
    {
        return $this->hasMany(ParsonsProblem::class);
    }

    /**
     * Boot the model and add cascade delete for problems.
     */
    protected static function booted(): void
    {
        static::deleting(function (Skill $skill) {
            // Cascade soft delete to problems when skill is soft deleted
            if ($skill->isForceDeleting()) {
                $skill->problems()->forceDelete();
            } else {
                $skill->problems()->delete();
            }
        });
    }
}
