<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route::get('/debug-check', function () {
//     return [
//         'php_version' => PHP_VERSION,
//         'xdebug_loaded' => extension_loaded('xdebug'),
//         'xdebug_mode' => ini_get('xdebug.mode'),
//         'variables_order' => ini_get('variables_order'),
//         'all_extensions' => get_loaded_extensions(),
//     ];
// });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('courses', \App\Http\Controllers\CourseController::class);

    // Skill routes nested under courses
    Route::prefix('courses/{course}')->name('courses.')->group(function () {
        Route::get('skills/builder', [\App\Http\Controllers\SkillController::class, 'builder'])
            ->name('skills.builder');

        Route::post('skills/builder', [\App\Http\Controllers\SkillController::class, 'storeBuilder'])
            ->name('skills.builder.store');
        Route::delete('skills/builder/{skill}', [\App\Http\Controllers\SkillController::class, 'destroyBuilder'])
            ->name('skills.builder.destroy');

        Route::patch('skills/{skill}/position', [\App\Http\Controllers\SkillController::class, 'updatePosition'])
            ->name('skills.position');
        Route::post('skills/sync', [\App\Http\Controllers\SkillController::class, 'sync'])
            ->name('skills.sync');
        Route::resource('skills', \App\Http\Controllers\SkillController::class);

        // Prerequisite management
        Route::post('skills/{skill}/prerequisites', [\App\Http\Controllers\SkillPrerequisiteController::class, 'store'])
            ->name('skills.prerequisites.store');
        Route::delete('skills/{skill}/prerequisites/{prerequisite}', [\App\Http\Controllers\SkillPrerequisiteController::class, 'destroy'])
            ->name('skills.prerequisites.destroy');
    });
});

require __DIR__.'/settings.php';
