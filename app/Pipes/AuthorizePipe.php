<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\Enums\Operation;
use Closure;
use Illuminate\Support\Facades\Gate;

/**
 * Pipe for checking authorization.
 *
 * Uses Laravel policies to authorize operations on models.
 */
class AuthorizePipe extends AbstractPipe
{
    /**
     * Handle the data transfer object through the pipe.
     */
    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        $this->authorize($dto);

        return $next($dto);
    }

    /**
     * Authorize the operation.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function authorize(DataTransferObjectInterface $dto): void
    {
        $model = $dto->getModel();
        $operation = $dto->getOperation();

        match ($operation) {
            Operation::Create => Gate::authorize('create', get_class($model ?? $this->inferModelClass($dto))),
            Operation::Update => Gate::authorize('update', $model),
            Operation::Delete => Gate::authorize('delete', $model),
        };
    }

    /**
     * Infer the model class from the DTO class name.
     */
    protected function inferModelClass(DataTransferObjectInterface $dto): string
    {
        $dtoClass = get_class($dto);
        $modelName = str_replace('Data', '', class_basename($dtoClass));

        return "App\\Models\\{$modelName}";
    }
}
