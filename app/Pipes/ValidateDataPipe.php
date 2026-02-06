<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use Closure;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Pipe for validating data.
 *
 * Validates data against defined rules for each DTO.
 */
class ValidateDataPipe extends AbstractPipe
{
    /**
     * Create a new pipe instance.
     *
     * @param  array<string, mixed>  $rules
     * @param  array<string, string>  $messages
     */
    public function __construct(
        protected array $rules = [],
        protected array $messages = []
    ) {}

    /**
     * Handle the data transfer object through the pipe.
     *
     * @throws ValidationException
     */
    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        if (! empty($this->rules)) {
            $validator = Validator::make($dto->toArray(), $this->rules, $this->messages);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        }

        return $next($dto);
    }
}
