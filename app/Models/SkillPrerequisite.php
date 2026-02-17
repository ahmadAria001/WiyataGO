<?php

namespace App\Models;

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SkillPrerequisite extends Pivot
{
    use UsesUnixTimestamps;

    protected $table = 'skill_prerequisites';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;
}
