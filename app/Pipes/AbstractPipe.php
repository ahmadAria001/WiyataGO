<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\Contracts\Pipeline\PipeInterface;
use Closure;

/**
 * Abstract base class for pipeline pipes.
 *
 * Provides common functionality for all pipes.
 */
abstract class AbstractPipe implements PipeInterface
{
    /**
     * Handle the data transfer object through the pipe.
     */
    abstract public function handle(DataTransferObjectInterface $dto, Closure $next): mixed;

    /**
     * Determine if the pipe should be bypassed.
     */
    protected function shouldPassThrough(DataTransferObjectInterface $dto): bool
    {
        return false;
    }

    /**
     * Pass through the pipe without processing if condition is met.
     */
    protected function passThrough(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        if ($this->shouldPassThrough($dto)) {
            return $next($dto);
        }

        return $this->process($dto, $next);
    }

    /**
     * Process the DTO. Override this method in concrete pipes.
     */
    protected function process(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        return $next($dto);
    }
}
