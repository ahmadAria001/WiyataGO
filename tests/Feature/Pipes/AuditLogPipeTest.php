<?php

use App\DataTransferObjects\UserData;
use App\Models\User;
use App\Pipes\AuditLogPipe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

uses(RefreshDatabase::class);

it('logs create operation', function () {
    Log::shouldReceive('channel')
        ->with('stack')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->once()
        ->withArgs(function ($message, $context) {
            return $message === 'Model created'
                && $context['operation'] === 'create'
                && isset($context['data']);
        });

    $user = User::factory()->create();
    $dto = UserData::forCreate(['name' => 'Test User', 'email' => 'test@example.com']);
    $dto->setModel($user);

    $pipe = new AuditLogPipe;
    $pipe->handle($dto, fn ($dto) => $dto);
});

it('logs update operation with changes', function () {
    Log::shouldReceive('channel')
        ->with('stack')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->once()
        ->withArgs(function ($message, $context) {
            return $message === 'Model updated'
                && $context['operation'] === 'update'
                && isset($context['changes']);
        });

    $user = User::factory()->create(['name' => 'Original Name']);
    $dto = UserData::forUpdate($user, ['name' => 'Updated Name']);

    $pipe = new AuditLogPipe;
    $pipe->handle($dto, fn ($dto) => $dto);
});

it('logs delete operation', function () {
    Log::shouldReceive('channel')
        ->with('stack')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->once()
        ->withArgs(function ($message, $context) {
            return $message === 'Model deleted'
                && $context['operation'] === 'delete';
        });

    $user = User::factory()->create();
    $dto = UserData::forDelete($user);

    $pipe = new AuditLogPipe;
    $pipe->handle($dto, fn ($dto) => $dto);
});

it('filters sensitive data from logs', function () {
    Log::shouldReceive('channel')
        ->with('stack')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->once()
        ->withArgs(function ($message, $context) {
            return $message === 'Model created'
                && $context['data']['password'] === '[REDACTED]'
                && $context['data']['name'] === 'Test User';
        });

    $user = User::factory()->create();
    $dto = UserData::forCreate([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'secret123',
    ]);
    $dto->setModel($user);

    $pipe = new AuditLogPipe;
    $pipe->handle($dto, fn ($dto) => $dto);
});

it('uses custom log channel', function () {
    Log::shouldReceive('channel')
        ->with('audit')
        ->andReturnSelf();

    Log::shouldReceive('info')->once();

    $user = User::factory()->create();
    $dto = UserData::forDelete($user);

    $pipe = new AuditLogPipe('audit');
    $pipe->handle($dto, fn ($dto) => $dto);
});

it('passes dto through to next pipe', function () {
    Log::shouldReceive('channel')->andReturnSelf();
    Log::shouldReceive('info');

    $user = User::factory()->create();
    $dto = UserData::forCreate(['name' => 'Test']);
    $dto->setModel($user);

    $pipe = new AuditLogPipe;
    $result = $pipe->handle($dto, fn ($dto) => $dto);

    expect($result)->toBe($dto);
});
