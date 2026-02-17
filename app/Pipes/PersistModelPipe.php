<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\Enums\Operation;
use Closure;

/**
 * Persists the model to the database based on the operation type.
 */
class PersistModelPipe extends AbstractPipe
{
    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        $operation = $dto->getOperation();

        match ($operation) {
            Operation::Create => $this->create($dto),
            Operation::Update => $this->update($dto),
            Operation::Delete => $this->delete($dto),
        };

        return $next($dto);
    }

    /**
     * Create a new model.
     */
    protected function create(DataTransferObjectInterface $dto): void
    {
        $model = $dto->getOrCreateModel();
        $model->fill($dto->getFillableData());
        $model->save();
        $dto->setModel($model);
    }

    /**
     * Update an existing model.
     */
    protected function update(DataTransferObjectInterface $dto): void
    {
        $model = $dto->getModel();
        $model->fill($dto->getFillableData());
        $model->save();
    }

    /**
     * Delete the model.
     */
    protected function delete(DataTransferObjectInterface $dto): void
    {
        $model = $dto->getModel();
        $model->delete();
    }
}
