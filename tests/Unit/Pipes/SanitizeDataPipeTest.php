<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Pipes\SanitizeDataPipe;

it('trims string values', function () {
    $dto = new class(['name' => '  John Doe  ', 'email' => ' test@example.com '], Operation::Create) extends ModelData {};
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('name'))->toBe('John Doe')
        ->and($result->get('email'))->toBe('test@example.com');
});

it('handles nested arrays', function () {
    $dto = new class(['user' => ['name' => '  Jane  ', 'details' => ['bio' => '  Hello World  ']]], Operation::Create) extends ModelData {};
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('user')['name'])->toBe('Jane')
        ->and($result->get('user')['details']['bio'])->toBe('Hello World');
});

it('preserves non-string values', function () {
    $dto = new class(['count' => 42, 'active' => true, 'items' => null], Operation::Create) extends ModelData {};
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->get('count'))->toBe(42)
        ->and($result->get('active'))->toBeTrue()
        ->and($result->get('items'))->toBeNull();
});

it('handles empty data gracefully', function () {
    $dto = new class([], Operation::Create) extends ModelData {};
    $pipe = new SanitizeDataPipe;

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result->toArray())->toBe([]);
});
