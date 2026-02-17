<?php

namespace App\Pipes;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\Enums\Operation;
use Closure;
use Illuminate\Support\Facades\Log;

/**
 * Logs model changes for audit purposes.
 *
 * Records operation type, model data, and user context to the application log.
 */
class AuditLogPipe extends AbstractPipe
{
    /**
     * The log channel to use.
     */
    protected string $channel = 'stack';

    public function __construct(?string $channel = null)
    {
        if ($channel !== null) {
            $this->channel = $channel;
        }
    }

    public function handle(DataTransferObjectInterface $dto, Closure $next): mixed
    {
        $beforeData = $dto->getModel()?->getOriginal() ?? [];

        $result = $next($dto);

        $this->logOperation($dto, $beforeData);

        return $result;
    }

    /**
     * Log the operation details.
     */
    protected function logOperation(DataTransferObjectInterface $dto, array $beforeData): void
    {
        $model = $dto->getModel();
        $operation = $dto->getOperation();
        $userId = auth()->id();

        $context = [
            'operation' => $operation->value,
            'model_type' => $model !== null ? get_class($model) : 'Unknown',
            'model_id' => $model?->getKey(),
            'user_id' => $userId,
            'timestamp' => now()->toIso8601String(),
        ];

        match ($operation) {
            Operation::Create => $this->logCreate($dto, $context),
            Operation::Update => $this->logUpdate($dto, $beforeData, $context),
            Operation::Delete => $this->logDelete($dto, $context),
        };
    }

    /**
     * Log create operation.
     */
    protected function logCreate(DataTransferObjectInterface $dto, array $context): void
    {
        Log::channel($this->channel)->info('Model created', array_merge($context, [
            'data' => $this->filterSensitiveData($dto->toArray()),
        ]));
    }

    /**
     * Log update operation.
     */
    protected function logUpdate(DataTransferObjectInterface $dto, array $beforeData, array $context): void
    {
        $changes = $this->getChanges($beforeData, $dto->toArray());

        Log::channel($this->channel)->info('Model updated', array_merge($context, [
            'changes' => $this->filterSensitiveData($changes),
        ]));
    }

    /**
     * Log delete operation.
     */
    protected function logDelete(DataTransferObjectInterface $dto, array $context): void
    {
        Log::channel($this->channel)->info('Model deleted', $context);
    }

    /**
     * Get changes between before and after data.
     *
     * @return array<string, array{before: mixed, after: mixed}>
     */
    protected function getChanges(array $before, array $after): array
    {
        $changes = [];

        foreach ($after as $key => $value) {
            $beforeValue = $before[$key] ?? null;
            if ($beforeValue !== $value) {
                $changes[$key] = [
                    'before' => $beforeValue,
                    'after' => $value,
                ];
            }
        }

        return $changes;
    }

    /**
     * Filter sensitive data from logs.
     *
     * @return array<string, mixed>
     */
    protected function filterSensitiveData(array $data): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'secret', 'api_key'];
        $filtered = [];

        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitiveKeys, true)) {
                $filtered[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $filtered[$key] = $this->filterSensitiveData($value);
            } else {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }
}
