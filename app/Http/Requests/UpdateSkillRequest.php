<?php

namespace App\Http\Requests;

use App\Enums\SkillCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSkillRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['nullable', Rule::enum(SkillCategory::class)],
            'content' => ['nullable', 'array'],
            'remedial_material_url' => ['nullable', 'url', 'max:500'],
            'position_x' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'position_y' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'difficulty' => ['nullable', 'string', 'in:beginner,intermediate,advanced'],
            'xp_reward' => ['nullable', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
