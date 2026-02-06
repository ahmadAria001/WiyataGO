<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUlids, Notifiable, SoftDeletes, TwoFactorAuthenticatable, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'total_xp',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
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
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'total_xp' => 'integer',
        ];
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin === true;
    }

    /**
     * Get the activity dates for the user.
     *
     * @return HasMany<UserActivityDate, $this>
     */
    public function activityDates(): HasMany
    {
        return $this->hasMany(UserActivityDate::class);
    }

    /**
     * Get the classrooms the student is enrolled in.
     *
     * @return BelongsToMany<Classroom, $this>
     */
    public function classrooms(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class)
            ->withTimestamps();
    }

    /**
     * Get the courses created by the user (if admin/teacher).
     *
     * @return HasMany<Course, $this>
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    /**
     * Get the skill progress for the user.
     *
     * @return HasMany<UserSkillProgress, $this>
     */
    public function skillProgress(): HasMany
    {
        return $this->hasMany(UserSkillProgress::class);
    }

    /**
     * Get the submissions made by the user.
     *
     * @return HasMany<Submission, $this>
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
