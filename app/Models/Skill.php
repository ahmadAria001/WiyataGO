<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use App\Enums\SkillCategory;
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
        'category',
        'content',
        'remedial_material_url',
        'position_x',
        'position_y',
        'difficulty',
        'xp_reward',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => SkillCategory::class,
            'content' => 'array',
        ];
    }

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
        )->using(SkillPrerequisite::class)->withTimestamps();
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
        )->using(SkillPrerequisite::class)->withTimestamps();
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
     * Check if adding a prerequisite would create a cycle in the DAG.
     *
     * If we add "prerequisite -> this", we need to check if "this" is already
     * an ancestor of "prerequisite" (i.e., can we reach "this" by following
     * the prerequisites of the proposed prerequisite skill).
     *
     * In other words: we traverse UP from prerequisiteId following its
     * prerequisites to see if we ever reach $this->id.
     */
    public function wouldCreateCycle(string $prerequisiteId): bool
    {
        $visited = [];
        $stack = [$prerequisiteId];

        while (! empty($stack)) {
            $currentId = array_pop($stack);

            if ($currentId === $this->id) {
                return true;
            }

            if (in_array($currentId, $visited)) {
                continue;
            }

            $visited[] = $currentId;

            // Get the prerequisites OF the current skill (traverse upward)
            $nextIds = \DB::table('skill_prerequisites')
                ->where('skill_id', $currentId)
                ->pluck('prerequisite_skill_id')
                ->toArray();

            $stack = array_merge($stack, $nextIds);
        }

        return false;
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
