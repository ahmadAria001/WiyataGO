<?php

namespace App\DataTransferObjects;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Model;

/**
 * Data Transfer Object for Skill model.
 */
class SkillData extends ModelData
{
    /**
     * Get the fillable attributes for the Skill model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array
    {
        return array_filter($this->data, fn ($key) => in_array($key, [
            'course_id',
            'name',
            'description',
            'category',
            'content',
            'remedial_material_url',
            'position_x',
            'position_y',
            'difficulty',
            'xp_reward',
        ]), ARRAY_FILTER_USE_KEY);
    }

    /**
     * Get or create the Skill model instance.
     */
    public function getOrCreateModel(): Model
    {
        if ($this->model === null) {
            $this->model = new Skill;
        }

        return $this->model;
    }
}
