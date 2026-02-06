<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    /** @use HasFactory<\Database\Factories\SubmissionFactory> */
    use HasFactory, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'parsons_problem_id',
        'submitted_solution',
        'is_correct',
        'xp_earned',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_solution' => 'array',
            'is_correct' => 'boolean',
            'xp_earned' => 'integer',
        ];
    }

    /**
     * Get the user that made the submission.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the problem for this submission.
     *
     * @return BelongsTo<ParsonsProblem, $this>
     */
    public function problem(): BelongsTo
    {
        return $this->belongsTo(ParsonsProblem::class, 'parsons_problem_id');
    }
}
