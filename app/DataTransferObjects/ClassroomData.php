<?php

namespace App\DataTransferObjects;

use App\Models\Classroom;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for Classroom model.
 */
class ClassroomData extends ModelData
{
    /**
     * Get the fillable attributes for the Classroom model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'name',
            'academic_year',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the Classroom model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new Classroom;
        }

        return $this->model;
    }
}
