<?php

use App\DataTransferObjects\ModelData;
use App\Enums\Operation;
use App\Pipes\ValidateDataPipe;
use Illuminate\Validation\ValidationException;

it('passes validation with valid data', function () {
    $dto = new class(['email' => 'test@example.com'], Operation::Create) extends ModelData {};
    $rules = ['email' => 'required|email'];
    $pipe = new ValidateDataPipe($rules);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});

it('throws validation exception with invalid data', function () {
    $dto = new class(['email' => 'not-an-email'], Operation::Create) extends ModelData {};
    $rules = ['email' => 'required|email'];
    $pipe = new ValidateDataPipe($rules);

    $pipe->handle($dto, fn ($dto) => $dto);
})->throws(ValidationException::class);

it('skips validation when no rules provided', function () {
    $dto = new class(['anything' => 'goes'], Operation::Create) extends ModelData {};
    $pipe = new ValidateDataPipe([]);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});

it('validates with custom error messages', function () {
    $dto = new class(['name' => ''], Operation::Create) extends ModelData {};
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
    $dto = new class(['name' => 'John Doe', 'email' => 'john@example.com', 'age' => 25], Operation::Create) extends ModelData {};
    $rules = [
        'name' => 'required|string',
        'email' => 'required|email',
        'age' => 'required|integer|min:18',
    ];
    $pipe = new ValidateDataPipe($rules);

    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});
