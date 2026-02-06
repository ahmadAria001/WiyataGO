<?php

namespace App\DataTransferObjects;

use App\Models\Submission;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for Submission model.
 */
class SubmissionData extends ModelData
{
    /**
     * Get the fillable attributes for the Submission model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'user_id',
            'parsons_problem_id',
            'submitted_solution',
            'is_correct',
            'xp_earned',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the Submission model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new Submission;
        }

        return $this->model;
    }
}
