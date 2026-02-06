<?php

use App\Concerns\UsesUnixTimestamps;
use Illuminate\Database\Eloquent\Model;

// Create a test model that uses the trait
class TestUnixTimestampModel extends Model
{
    use UsesUnixTimestamps;
}

it('returns Unix date format', function () {
    $model = new TestUnixTimestampModel;

    expect($model->getDateFormat())->toBe('U');
});

it('serializes dates to Unix timestamp', function () {
    $model = new TestUnixTimestampModel;

    $date = new \DateTime('2026-02-03 12:00:00', new \DateTimeZone('UTC'));

    $serialized = invade($model)->serializeDate($date);

    expect($serialized)->toBe($date->getTimestamp());
    expect($serialized)->toBeInt();
});
