<?php

use App\DataTransferObjects\UserData;
use App\Models\User;
use App\Pipes\SanitizeDataPipe;
use App\Pipes\ValidateDataPipe;
use App\Services\ModelPipelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

it('executes full pipeline for creating user', function () {
    $data = [
        'name' => '  John Doe  ',
        'email' => 'john@example.com',
        'password' => 'password123',
    ];

    $dto = UserData::forCreate($data);
    $service = new ModelPipelineService;

    $pipes = [
        new SanitizeDataPipe,
        new ValidateDataPipe([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]),
    ];

    // Execute pipeline
    $testPipe = new class
    {
        public function handle($dto, Closure $next)
        {
            $model = $dto->getOrCreateModel();
            $model->fill($dto->getFillableData());
            $model->save();
            $dto->setModel($model);

            return $next($dto);
        }
    };

    $result = $service->execute($dto, [...$pipes, $testPipe]);

    expect($result)->toBeInstanceOf(User::class)
        ->and($result->exists)->toBeTrue()
        ->and($result->name)->toBe('John Doe') // Sanitized
        ->and($result->email)->toBe('john@example.com');
});

it('validates data before processing', function () {
    $data = [
        'name' => 'Jane Doe',
        'email' => 'not-an-email',
    ];

    $dto = UserData::forCreate($data);
    $service = new ModelPipelineService;

    $pipes = [
        new ValidateDataPipe([
            'email' => 'required|email',
        ]),
    ];

    $service->execute($dto, $pipes);
})->throws(ValidationException::class);

it('sanitizes data in pipeline', function () {
    $data = [
        'name' => '  Alice  ',
        'email' => ' alice@example.com ',
    ];

    $user = User::factory()->create();
    $dto = UserData::forUpdate($user, $data);
    $service = new ModelPipelineService;

    $pipes = [new SanitizeDataPipe];

    $result = $service->execute($dto, $pipes);

    expect($dto->get('name'))->toBe('Alice')
        ->and($dto->get('email'))->toBe('alice@example.com')
        ->and($result)->toBeInstanceOf(User::class);
});

it('handles update operations', function () {
    $user = User::factory()->create(['name' => 'Original Name']);
    $data = ['name' => '  Updated Name  '];

    $dto = UserData::forUpdate($user, $data);
    $service = new ModelPipelineService;

    $pipes = [
        new SanitizeDataPipe,
        new ValidateDataPipe(['name' => 'required|string']),
    ];

    $testPipe = new class
    {
        public function handle($dto, Closure $next)
        {
            $model = $dto->getModel();
            $model->fill($dto->getFillableData());
            $model->save();

            return $next($dto);
        }
    };

    $result = $service->execute($dto, [...$pipes, $testPipe]);

    expect($result->name)->toBe('Updated Name')
        ->and($result->id)->toBe($user->id);
});

it('chains multiple pipes correctly', function () {
    $data = [
        'name' => '  Bob  ',
        'email' => 'bob@example.com',
        'password' => 'secure123',
    ];

    $dto = UserData::forCreate($data);
    $service = new ModelPipelineService;

    $orderTracker = [];

    $pipe1 = new class($orderTracker) extends \App\Pipes\AbstractPipe
    {
        public function __construct(private array &$tracker) {}

        public function handle($dto, Closure $next): mixed
        {
            $this->tracker[] = 'pipe1';

            return $next($dto);
        }
    };

    $pipe2 = new class($orderTracker) extends \App\Pipes\AbstractPipe
    {
        public function __construct(private array &$tracker) {}

        public function handle($dto, Closure $next): mixed
        {
            $this->tracker[] = 'pipe2';

            return $next($dto);
        }
    };

    $pipe3 = new class($orderTracker) extends \App\Pipes\AbstractPipe
    {
        public function __construct(private array &$tracker) {}

        public function handle($dto, Closure $next): mixed
        {
            $this->tracker[] = 'pipe3';
            // Set a model so ModelPipelineService.execute() doesn't throw
            $dto->setModel($dto->getOrCreateModel());

            return $next($dto);
        }
    };

    $service->execute($dto, [$pipe1, $pipe2, $pipe3]);

    expect($orderTracker)->toBe(['pipe1', 'pipe2', 'pipe3']);
});
