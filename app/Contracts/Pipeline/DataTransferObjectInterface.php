<?php

namespace App\Contracts\Pipeline;

use Illuminate\Database\Eloquent\Model;

/**
 * Interface for Data Transfer Objects used in pipelines.
 *
 * Provides standard methods for data access and model management.
 */
interface DataTransferObjectInterface
{
    /**
     * Convert the DTO to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array;

    /**
     * Get the associated Eloquent model.
     */
    public function getModel(): ?Model;

    /**
     * Set the associated Eloquent model.
     */
    public function setModel(Model $model): self;

    /**
     * Get a data value by key.
     */
    public function get(string $key, mixed $default = null): mixed;

    /**
     * Set a data value by key.
     */
    public function set(string $key, mixed $value): self;

    /**
     * Check if a data key exists.
     */
    public function has(string $key): bool;

    /**
     * Get the operation being performed.
     */
    public function getOperation(): \App\Enums\Operation;

    /**
     * Get or create the model instance.
     */
    public function getOrCreateModel(): \Illuminate\Database\Eloquent\Model;

    /**
     * Get only the fillable data for the model.
     *
     * @return array<string, mixed>
     */
    public function getFillableData(): array;
}
