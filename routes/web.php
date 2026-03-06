<?php

use App\Http\Controllers\Admin\BillCollectorController;
use App\Http\Controllers\Admin\ConsumerController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth','role:admin'])
    ->prefix('admin')
    ->group(function () {

    Route::resource('billcollectors',BillCollectorController::class);

    Route::resource('consumers', ConsumerController::class);

    Route::post('consumers/import', [ConsumerController::class, 'import'])
        ->name('consumers.import');

});

require __DIR__.'/settings.php';
