<?php

namespace App\Enums;

/**
 * Enum representing pipeline operations.
 */
enum Operation: string
{
    case Create = 'create';
    case Update = 'update';
    case Delete = 'delete';
}
