<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserActivityDate extends Model
{
    /** @use HasFactory<\Database\Factories\UserActivityDateFactory> */
    use HasFactory, UsesUnixTimestamps;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'activity_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activity_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the activity date.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
