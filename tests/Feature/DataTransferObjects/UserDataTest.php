<?php

use App\DataTransferObjects\UserData;
use App\Enums\Operation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create UserData from array', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ];

    $userDto = UserData::forCreate($data);

    expect($userDto->toArray())->toBe($data)
        ->and($userDto->getOperation())->toBe(Operation::Create);
});

it('filters only fillable data', function () {
    $data = [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'secret123',
        'unauthorized_field' => 'should be filtered',
    ];

    $userDto = new UserData($data, Operation::Create);
    $fillable = $userDto->getFillableData();

    expect($fillable)->toHaveKey('name')
        ->and($fillable)->toHaveKey('email')
        ->and($fillable)->toHaveKey('password')
        ->and($fillable)->not->toHaveKey('unauthorized_field');
});

it('gets or creates model instance', function () {
    $userDto = UserData::forCreate(['name' => 'Test']);

    $model = $userDto->getOrCreateModel();

    expect($model)->toBeInstanceOf(User::class)
        ->and($model->exists)->toBeFalse();
});

it('preserves existing model', function () {
    $user = User::factory()->make();
    $userDto = UserData::forUpdate($user, ['name' => 'Updated']);

    $model = $userDto->getOrCreateModel();

    expect($model)->toBe($user);
});
