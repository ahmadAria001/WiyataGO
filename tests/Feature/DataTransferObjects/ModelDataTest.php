<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can be created with data and operation', function () {
    $data = ['name' => 'John Doe', 'email' => 'john@example.com'];
    $dto = new class($data, Operation::Create) extends ModelData {};

    expect($dto->toArray())->toBe($data)
        ->and($dto->getOperation())->toBe(Operation::Create)
        ->and($dto->getModel())->toBeNull();
});

it('can set and get model', function () {
    $dto = new class([], Operation::Create) extends ModelData {};
    $user = User::factory()->make();

    $dto->setModel($user);

    expect($dto->getModel())->toBe($user);
});

it('can get data value by key', function () {
    $dto = new class(['name' => 'Jane'], Operation::Create) extends ModelData {};

    expect($dto->get('name'))->toBe('Jane')
        ->and($dto->get('missing', 'default'))->toBe('default');
});

it('can set data value by key', function () {
    $dto = new class([], Operation::Create) extends ModelData {};

    $dto->set('name', 'Alice');

    expect($dto->get('name'))->toBe('Alice');
});

it('can check if key exists', function () {
    $dto = new class(['name' => 'Bob'], Operation::Create) extends ModelData {};

    expect($dto->has('name'))->toBeTrue()
        ->and($dto->has('missing'))->toBeFalse();
});

it('creates forCreate instance correctly', function () {
    $data = ['name' => 'Test'];
    $dto = new class([], Operation::Create) extends ModelData
    {
        public static function makeForCreate(array $data): static
        {
            return self::forCreate($data);
        }
    };

    $created = $dto::makeForCreate($data);

    expect($created->toArray())->toBe($data)
        ->and($created->getOperation())->toBe(Operation::Create);
});

it('creates forUpdate instance correctly', function () {
    $user = User::factory()->make();
    $data = ['name' => 'Updated'];
    $dto = new class([], Operation::Create) extends ModelData
    {
        public static function makeForUpdate($model, array $data): static
        {
            return self::forUpdate($model, $data);
        }
    };

    $updated = $dto::makeForUpdate($user, $data);

    expect($updated->toArray())->toBe($data)
        ->and($updated->getOperation())->toBe(Operation::Update)
        ->and($updated->getModel())->toBe($user);
});

it('creates forDelete instance correctly', function () {
    $user = User::factory()->make();
    $dto = new class([], Operation::Create) extends ModelData
    {
        public static function makeForDelete($model): static
        {
            return self::forDelete($model);
        }
    };

    $deleted = $dto::makeForDelete($user);

    expect($deleted->toArray())->toBe([])
        ->and($deleted->getOperation())->toBe(Operation::Delete)
        ->and($deleted->getModel())->toBe($user);
});
