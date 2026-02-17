<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Create a concrete test DTO to satisfy ModelData's abstract methods.
 */
function createModelTestDto(array $data, Operation $operation = Operation::Create): ModelData
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

        // Helper methods to access static factory methods for testing
        public static function makeForCreate(array $data): static
        {
            return self::forCreate($data);
        }

        public static function makeForUpdate(Model $model, array $data): static
        {
            return self::forUpdate($model, $data);
        }

        public static function makeForDelete(Model $model): static
        {
            return self::forDelete($model);
        }
    };
}

it('can be created with data and operation', function () {
    $data = ['name' => 'John Doe', 'email' => 'john@example.com'];
    $dto = createModelTestDto($data);

    expect($dto->toArray())->toBe($data)
        ->and($dto->getOperation())->toBe(Operation::Create)
        ->and($dto->getModel())->toBeNull();
});

it('can set and get model', function () {
    $dto = createModelTestDto([]);
    $user = User::factory()->make();

    $dto->setModel($user);

    expect($dto->getModel())->toBe($user);
});

it('can get data value by key', function () {
    $dto = createModelTestDto(['name' => 'Jane']);

    expect($dto->get('name'))->toBe('Jane')
        ->and($dto->get('missing', 'default'))->toBe('default');
});

it('can set data value by key', function () {
    $dto = createModelTestDto([]);

    $dto->set('name', 'Alice');

    expect($dto->get('name'))->toBe('Alice');
});

it('can check if key exists', function () {
    $dto = createModelTestDto(['name' => 'Bob']);

    expect($dto->has('name'))->toBeTrue()
        ->and($dto->has('missing'))->toBeFalse();
});

it('creates forCreate instance correctly', function () {
    $data = ['name' => 'Test'];
    $tempDto = createModelTestDto([]); // Just to access the class

    $created = $tempDto::makeForCreate($data);

    expect($created->toArray())->toBe($data)
        ->and($created->getOperation())->toBe(Operation::Create);
});

it('creates forUpdate instance correctly', function () {
    $user = User::factory()->make();
    $data = ['name' => 'Updated'];
    $tempDto = createModelTestDto([]);

    $updated = $tempDto::makeForUpdate($user, $data);

    expect($updated->toArray())->toBe($data)
        ->and($updated->getOperation())->toBe(Operation::Update)
        ->and($updated->getModel())->toBe($user);
});

it('creates forDelete instance correctly', function () {
    $user = User::factory()->make();
    $tempDto = createModelTestDto([]);

    $deleted = $tempDto::makeForDelete($user);

    expect($deleted->toArray())->toBe([])
        ->and($deleted->getOperation())->toBe(Operation::Delete)
        ->and($deleted->getModel())->toBe($user);
});
