<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Pipes\SanitizeDataPipe;
use Illuminate\Database\Eloquent\Model;

/**
 * Create a concrete test DTO to satisfy ModelData's abstract methods.
 */
function createTestDto(array $data, Operation $operation = Operation::Create): ModelData
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

it('trims string values', function () {
    $dto = createTestDto(['name' => '  John Doe  ', 'email' => ' test@example.com ']);
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('name'))->toBe('John Doe')
        ->and($result->get('email'))->toBe('test@example.com');
});

it('handles nested arrays', function () {
    $dto = createTestDto(['user' => ['name' => '  Jane  ', 'details' => ['bio' => '  Hello World  ']]]);
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('user')['name'])->toBe('Jane')
        ->and($result->get('user')['details']['bio'])->toBe('Hello World');
});

it('preserves non-string values', function () {
    $dto = createTestDto(['count' => 42, 'active' => true, 'items' => null]);
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('count'))->toBe(42)
        ->and($result->get('active'))->toBeTrue()
        ->and($result->get('items'))->toBeNull();
});

it('handles empty data gracefully', function () {
    $dto = createTestDto([]);
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->toArray())->toBe([]);
});
