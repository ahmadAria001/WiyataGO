<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    /** @use HasFactory<\Database\Factories\ClassroomFactory> */
    use HasFactory, HasUlids, SoftDeletes, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'academic_year',
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
            'academic_year' => 'integer',
        ];
    }

    /**
     * Get the students enrolled in the classroom.
     *
     * @return BelongsToMany<User, $this>
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withTimestamps();
    }

    /**
     * Get the courses assigned to this classroom.
     *
     * @return BelongsToMany<Course, $this>
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class)
            ->withTimestamps();
    }
}
