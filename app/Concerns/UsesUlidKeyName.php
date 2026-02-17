<?php

namespace App\Concerns;

trait UsesUlidKeyName
{
    protected $hidden = [
        'id',
    ];

    /**
     * Get the primary key for the model.
     *
     * @return string
     */
    public function getKeyName()
    {
        return 'ulid';
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'ulid';
    }
}
