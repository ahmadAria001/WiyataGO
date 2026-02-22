<?php

use App\Enums\SkillCategory;

test('it has the correct enum cases', function () {
    $cases = SkillCategory::cases();

    expect($cases)->toHaveCount(3);
    expect(array_map(fn ($c) => $c->value, $cases))->toBe(['theory', 'practice', 'review']);
});

test('it can be created from string value', function () {
    expect(SkillCategory::from('theory'))->toBe(SkillCategory::Theory);
    expect(SkillCategory::from('practice'))->toBe(SkillCategory::Practice);
    expect(SkillCategory::from('review'))->toBe(SkillCategory::Review);
});

test('it throws for invalid value', function () {
    SkillCategory::from('invalid');
})->throws(ValueError::class);
