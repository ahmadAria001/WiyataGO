<?php

namespace App\Enums;

/**
 * Enum representing skill categories.
 */
enum SkillCategory: string
{
    case Theory = 'theory';
    case Practice = 'practice';
    case Review = 'review';
}
