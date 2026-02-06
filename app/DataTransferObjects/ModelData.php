<?php

namespace App\DataTransferObjects;

use App\Contracts\Pipeline\DataTransferObjectInterface;
use App\Enums\Operation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Abstract base class for model data transfer objects.
 *
 * Provides common functionality for all model DTOs.
 */
abstract class ModelData implements DataTransferObjectInterface
{
    /**
     * Create a new ModelData instance.
     *
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        protected array $data,
        protected Operation $operation,
        protected ?Model $model = null
    ) {}

    /**
     * Create a new instance from a request.
     */
    public static function fromRequest(Request $request, Operation $operation): static
    {
        return new static($request->all(), $operation);
    }

    /**
     * Create a new instance for creating a model.
     *
     * @param  array<string, mixed>  $data
     */
    public static function forCreate(array $data): static
    {
        return new static($data, Operation::Create);
    }

    /**
     * Create a new instance for updating a model.
     *
     * @param  array<string, mixed>  $data
     */
    public static function forUpdate(Model $model, array $data): static
    {
        return new static($data, Operation::Update, $model);
    }

    /**
     * Create a new instance for deleting a model.
     */
    public static function forDelete(Model $model): static
    {
        return new static([], Operation::Delete, $model);
    }

    /**
     * Convert the DTO to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->data;
    }

    /**
     * Get the associated Eloquent model.
     */
    public function getModel(): ?Model
    {
        return $this->model;
    }

    /**
     * Set the associated Eloquent model.
     */
    public function setModel(Model $model): self
    {
        $this->model = $model;

        return $this;
    }

    /**
     * Get the operation type.
     */
    public function getOperation(): Operation
    {
        return $this->operation;
    }

    /**
     * Get a data value by key.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->data[$key] ?? $default;
    }

    /**
     * Set a data value by key.
     */
    public function set(string $key, mixed $value): self
    {
        $this->data[$key] = $value;

        return $this;
    }

    /**
     * Check if a data key exists.
     */
    public function has(string $key): bool
    {
        return array_key_exists($key, $this->data);
    }
}
