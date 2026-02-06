<?php

namespace App\Contracts\Pipeline;

use Closure;

/**
 * Interface for pipeline pipes.
 *
 * Each pipe should implement this interface to be used in the data pipeline.
 */
interface PipeInterface
{
    /**
     * Handle the data transfer object through the pipe.
     */
    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed;
}
