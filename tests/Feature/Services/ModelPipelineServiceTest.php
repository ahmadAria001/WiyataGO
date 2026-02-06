<?php

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\DataTransferObjects\UserData;
use App\Models\User;
use App\Services\ModelPipelineService;

it('executes pipeline without transaction', function () {
    $user = User::factory()->create();
    $dto = UserData::forUpdate($user, ['name' => 'Updated Name']);
    $service = new ModelPipelineService;

    $mockPipe = new class
    {
        public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
        {
            $dto->set('processed', true);
            $dto->setModel($dto->getModel() ?? User::factory()->create());

            return $next($dto);
        }
    };

    $result = $service->execute($dto, [$mockPipe]);

    expect($result)->toBeInstanceOf(User::class)
        ->and($dto->get('processed'))->toBeTrue();
});

it('returns default pipes', function () {
    $service = new ModelPipelineService;

    $pipes = $service->getDefaultPipes();

    expect($pipes)->toBeArray()
        ->and($pipes)->toContain(\App\Pipes\SanitizeDataPipe::class);
});

it('handles empty pipes array', function () {
    $user = User::factory()->create();
    $dto = UserData::forUpdate($user, ['name' => 'Test']);
    $service = new ModelPipelineService;

    // Need to ensure model is set before return
    $result = $service->execute($dto, []);

    expect($result)->toBeInstanceOf(User::class)
        ->and($result->id)->toBe($user->id);
});
