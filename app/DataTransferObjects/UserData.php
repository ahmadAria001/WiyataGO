<?php

namespace App\DataTransferObjects;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for User model.
 */
class UserData extends ModelData
{
    /**
     * Get the fillable attributes for the User model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'name',
            'email',
            'password',
            'total_xp',
            'is_admin',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the User model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new User;
        }

        return $this->model;
    }
}
