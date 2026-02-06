<?php

namespace App\DataTransferObjects;

use App\Models\ParsonsProblem;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for ParsonsProblem model.
 */
class ParsonsProblemData extends ModelData
{
    /**
     * Get the fillable attributes for the ParsonsProblem model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'skill_id',
            'title',
            'description',
            'blocks',
            'solution',
            'xp_value',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the ParsonsProblem model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new ParsonsProblem;
        }

        return $this->model;
    }
}
