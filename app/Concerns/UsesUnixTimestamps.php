<?php

namespace App\Concerns;

use DateTimeInterface;

/**
 * Trait for using Unix timestamps (bigint) instead of datetime columns.
 *
 * This enables timezone-agnostic storage for cross-region synchronization.
 */
trait UsesUnixTimestamps
{
    public function initializeUsesUnixTimestamps()
    {
        $this->makeHidden('id');
        $this->makeVisible('ulid');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    /**
     * Get the format for database stored dates.
     */
    public function getDateFormat(): string
    {
        return 'U'; // Unix timestamp format
    }

    /**
     * Serialize dates to Unix timestamp for JSON/API responses.
     */
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
