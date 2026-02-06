<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkillProgress extends Model
{
    /** @use HasFactory<\Database\Factories\UserSkillProgressFactory> */
    use HasFactory, UsesUnixTimestamps;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_skill_progress';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'skill_id',
        'status',
        'current_lives',
        'high_score',
        'cooldown_ends_at',
        'lives_last_reset',
    ];

    /**
     * Status constants.
     */
    public const STATUS_LOCKED = 'locked';

    public const STATUS_UNLOCKED = 'unlocked';

    public const STATUS_MASTERED = 'mastered';

    /**
     * Default number of lives.
     */
    public const DEFAULT_LIVES = 3;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_lives' => 'integer',
            'high_score' => 'integer',
            'cooldown_ends_at' => 'datetime',
            'lives_last_reset' => 'date',
        ];
    }

    /**
     * Get the user that owns the progress.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the skill for this progress.
     *
     * @return BelongsTo<Skill, $this>
     */
    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }

    /**
     * Check if the skill is locked.
     */
    public function isLocked(): bool
    {
        return $this->status === self::STATUS_LOCKED;
    }

    /**
     * Check if the skill is unlocked.
     */
    public function isUnlocked(): bool
    {
        return $this->status === self::STATUS_UNLOCKED;
    }

    /**
     * Check if the skill is mastered.
     */
    public function isMastered(): bool
    {
        return $this->status === self::STATUS_MASTERED;
    }

    /**
     * Check if currently in cooldown.
     */
    public function isInCooldown(): bool
    {
        return $this->cooldown_ends_at !== null && $this->cooldown_ends_at->isFuture();
    }

    /**
     * Check if lives need to be reset (new day).
     */
    public function needsLivesReset(): bool
    {
        return $this->lives_last_reset === null || $this->lives_last_reset->isYesterday() || $this->lives_last_reset->isPast();
    }

    /**
     * Check if user has lives remaining.
     */
    public function hasLives(): bool
    {
        return $this->current_lives > 0;
    }
}
