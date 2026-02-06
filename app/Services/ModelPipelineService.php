<?php

namespace App\Services;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Pipeline;

/**
 * Service for orchestrating data pipelines.
 *
 * Provides methods to execute data through pipeline pipes with optional transaction support.
 */
class ModelPipelineService
{
    /**
     * Execute the pipeline without transaction wrapping.
     *
     * @param  array<class-string>  $pipes
     */
    public function execute(DataTransferObjectInterface $dto, array $pipes = []): Model
    {
        $result = Pipeline::send($dto)
            ->through($pipes)
            ->thenReturn();

        $model = $result->getModel();

        if ($model === null) {
            throw new \RuntimeException('Pipeline did not set a model on the DTO');
        }

        return $model;
    }

    /**
     * Execute the pipeline within a database transaction.
     *
     * @param  array<class-string>  $pipes
     */
    public function executeWithTransaction(DataTransferObjectInterface $dto, array $pipes = []): Model
    {
        $result = Pipeline::send($dto)
            ->withinTransaction()
            ->through($pipes)
            ->thenReturn();

        $model = $result->getModel();

        if ($model === null) {
            throw new \RuntimeException('Pipeline did not set a model on the DTO');
        }

        return $model;
    }

    /**
     * Get default pipes for common operations.
     *
     * @return array<class-string>
     */
    public function getDefaultPipes(): array
    {
        return [
            \App\Pipes\SanitizeDataPipe::class,
        ];
    }
}
