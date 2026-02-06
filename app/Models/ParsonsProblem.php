<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParsonsProblem extends Model
{
    /** @use HasFactory<\Database\Factories\ParsonsProblemFactory> */
    use HasFactory, HasUlids, SoftDeletes, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'skill_id',
        'title',
        'description',
        'blocks',
        'solution',
        'xp_value',
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'solution' => 'array',
            'xp_value' => 'integer',
        ];
    }

    /**
     * Get the skill that owns the problem.
     *
     * @return BelongsTo<Skill, $this>
     */
    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }

    /**
     * Get the submissions for this problem.
     *
     * @return HasMany<Submission, $this>
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Check if the given solution is correct.
     *
     * @param  array<int>  $submittedSolution
     */
    public function isCorrectSolution(array $submittedSolution): bool
    {
        return $this->solution === $submittedSolution;
    }
}
