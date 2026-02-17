<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Pipes\ValidateDataPipe;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

/**
 * Create a concrete test DTO to satisfy ModelData's abstract methods.
 */
function createValidateTestDto(array $data, Operation $operation = Operation::Create): ModelData
{
    return new class($data, $operation) extends ModelData
    {
        public function getOrCreateModel(): Model
        {
            return $this->model ?? new class extends Model
            {
                protected $guarded = [];
            };
        }

        /**
         * @return array<string, mixed>
         */
        public function getFillableData(): array
        {
            return $this->data;
        }
    };
}

it('passes validation with valid data', function () {
    $dto = createValidateTestDto(['email' => 'test@example.com']);
    $rules = ['email' => 'required|email'];
    $pipe = new ValidateDataPipe($rules);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});

it('throws validation exception with invalid data', function () {
    $dto = createValidateTestDto(['email' => 'not-an-email']);
    $rules = ['email' => 'required|email'];
    $pipe = new ValidateDataPipe($rules);

    $pipe->handle($dto, fn ($dto) => $dto);
})->throws(ValidationException::class);

it('skips validation when no rules provided', function () {
    $dto = createValidateTestDto(['anything' => 'goes']);
    $pipe = new ValidateDataPipe([]);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});

it('validates with custom error messages', function () {
    $dto = createValidateTestDto(['name' => '']);
    $rules = ['name' => 'required'];
    $messages = ['name.required' => 'Custom error message'];
    $pipe = new ValidateDataPipe($rules, $messages);

    try {
        $pipe->handle($dto, fn ($dto) => $dto);
        $this->fail('Expected ValidationException was not thrown');
    } catch (ValidationException $e) {
        expect($e->errors()['name'][0])->toBe('Custom error message');
    }
});

it('validates multiple fields', function () {
    $dto = createValidateTestDto(['name' => 'John Doe', 'email' => 'john@example.com', 'age' => 25]);
    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
        'age' => 'required|integer|min:18',
    ];
    $pipe = new ValidateDataPipe($rules);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});
