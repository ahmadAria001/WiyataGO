<?php

namespace App\DataTransferObjects;

use App\Models\Course;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for Course model.
 */
class CourseData extends ModelData
{
    /**
     * Get the fillable attributes for the Course model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'teacher_id',
            'name',
            'description',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the Course model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new Course;
        }

        return $this->model;
    }
}
