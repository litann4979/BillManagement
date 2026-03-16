<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectorConsumerController;
use App\Http\Controllers\Api\CollectorDefaulterController;
use App\Http\Controllers\Api\CollectorGpsController;
use App\Http\Controllers\Api\CollectorVisitHistoryController;
use App\Http\Controllers\Api\CollectorVisitPlanController;
use App\Http\Controllers\Api\ConsumerFlagController;
use App\Http\Controllers\Api\GrievanceController;
use App\Http\Controllers\Api\UnauthorizedConnectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromiseToPayController;
use App\Http\Controllers\Api\SiteVisitController;
use App\Http\Controllers\Api\VisitLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ──────────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────────

Route::post('/billcollector/login', [AuthController::class, 'login']);

// ──────────────────────────────────────────────
// Bill Collector APIs (auth + role guard)
// ──────────────────────────────────────────────

Route::middleware(['auth:sanctum', 'billcollector'])->group(function () {

    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Visit Plans
    Route::prefix('collector')->group(function () {

        Route::get('/visit-plans', [CollectorVisitPlanController::class, 'index']);
        Route::post('/visit-plans', [CollectorVisitPlanController::class, 'store']);
        Route::get('/visit-plans/{id}', [CollectorVisitPlanController::class, 'show']);
        Route::put('/visit-plans/{id}', [CollectorVisitPlanController::class, 'update']);
        Route::delete('/visit-plans/{id}', [CollectorVisitPlanController::class, 'destroy']);
        Route::post('/visit-plans/{plan_id}/consumers', [CollectorVisitPlanController::class, 'addConsumers']);

        // Today's visits
        Route::get('/today-visits', [CollectorVisitPlanController::class, 'todayVisits']);

        // Consumers
        Route::get('/consumers', [CollectorConsumerController::class, 'index']);
        Route::get('/consumer/{consumer_id}', [CollectorConsumerController::class, 'show']);
        Route::get('/consumer/{consumer_id}/download-pdf', [CollectorConsumerController::class, 'downloadPdf']);

        // Live Location
        Route::post('/live-location', [CollectorGpsController::class, 'store']);

        // Consumer Flag
        Route::post('/consumer-flag', [ConsumerFlagController::class, 'store']);

        // Site Visit
        Route::post('/site-visit', [SiteVisitController::class, 'store']);

        // Grievance
        Route::post('/grievance', [GrievanceController::class, 'store']);

        // Unauthorized Connection
        Route::post('/unauthorized-connection', [UnauthorizedConnectionController::class, 'store']);

        // Defaulters
        Route::get('/defaulters', [CollectorDefaulterController::class, 'index']);
        Route::get('/defaulters/3-month', [CollectorDefaulterController::class, 'threeMonth']);
        Route::get('/defaulters/village/{village_id}', [CollectorDefaulterController::class, 'byVillage']);
        Route::get('/defaulters/dtr/{dtr_id}', [CollectorDefaulterController::class, 'byDtr']);

        // Visit history
        Route::get('/visit-history', [CollectorVisitHistoryController::class, 'index']);
    });

    // Visit Logs
    Route::post('/visit-logs', [VisitLogController::class, 'store']);

    // Payments
    Route::post('/payments', [PaymentController::class, 'store']);

    // Promise to Pay
    Route::post('/promise-to-pay', [PromiseToPayController::class, 'store']);
});
