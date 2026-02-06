<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use Closure;

/**
 * Pipe for sanitizing input data.
 *
 * Trims strings, handles null values, and normalizes data formats.
 */
class SanitizeDataPipe extends AbstractPipe
{
    /**
     * Handle the data transfer object through the pipe.
     */
    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        $sanitizedData = $this->sanitize($dto->toArray());

        foreach ($sanitizedData as $key => $value) {
            $dto->set($key, $value);
        }

        return $next($dto);
    }

    /**
     * Sanitize the data array.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function sanitize(array $data): array
    {
        return array_map(function ($value) {
            if (is_string($value)) {
                return trim($value);
            }

            if (is_array($value)) {
                return $this->sanitize($value);
            }

            return $value;
        }, $data);
    }
}
