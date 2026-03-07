<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsumerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/billcollector/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', [AuthController::class, 'profile']);

     Route::get('/consumers', [ConsumerController::class, 'index']);

    Route::get('/consumers/{id}', [ConsumerController::class, 'show']);

    Route::post('/logout', [AuthController::class, 'logout']);

});


