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

require __DIR__.'/settings.php';
