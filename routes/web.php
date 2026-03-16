<?php

use App\Http\Controllers\Admin\BillCollectorController;
use App\Http\Controllers\Admin\ConsumerController;
use App\Http\Controllers\Admin\CircleController;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\SubdivisionController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\VillageController;
use App\Http\Controllers\Admin\FeederController;
use App\Http\Controllers\Admin\DtrController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DefaulterManagementController;
use App\Http\Controllers\Admin\HierarchyController;
use App\Http\Controllers\Admin\VisitManagementController;
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

    Route::resource('billcollectors', BillCollectorController::class);
    Route::patch('billcollectors/{billcollector}/toggle-status', [BillCollectorController::class, 'toggleStatus'])
        ->name('billcollectors.toggle-status');

    Route::resource('consumers', ConsumerController::class);

    Route::post('consumers/import', [ConsumerController::class, 'import'])
        ->name('consumers.import');
    Route::get('import-jobs/{id}', [ConsumerController::class, 'importProgress'])
        ->name('import-jobs.progress');

    // Hierarchy CRUD
    Route::resource('circles', CircleController::class)->except('show');
    Route::resource('divisions', DivisionController::class)->except('show');
    Route::resource('subdivisions', SubdivisionController::class)->except('show');
    Route::resource('sections', SectionController::class)->except('show');
    Route::resource('villages', VillageController::class)->except('show');
    Route::resource('feeders', FeederController::class)->except('show');
    Route::resource('dtrs', DtrController::class)->except('show');
    Route::resource('categories', CategoryController::class)->except('show');

    // Visit Management
    Route::get('visit-management', [VisitManagementController::class, 'index'])->name('visit-management.index');

    // Defaulters Management
    Route::get('defaulters', [DefaulterManagementController::class, 'index'])->name('defaulters.index');
    Route::post('defaulters/flag', [DefaulterManagementController::class, 'flag'])->name('defaulters.flag');
});

// Hierarchy API endpoints for dependent dropdowns
Route::middleware(['auth'])
    ->prefix('api')
    ->group(function () {

    Route::get('/divisions/{circle}', [HierarchyController::class, 'divisions']);
    Route::get('/subdivisions/{division}', [HierarchyController::class, 'subdivisions']);
    Route::get('/sections/{subdivision}', [HierarchyController::class, 'sections']);
    Route::get('/villages/{section}', [HierarchyController::class, 'villages']);
    Route::get('/feeders/{section}', [HierarchyController::class, 'feeders']);
    Route::get('/dtrs/{feeder}', [HierarchyController::class, 'dtrs']);
});

require __DIR__.'/settings.php';
