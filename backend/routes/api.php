<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RentalController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/vehicles/available', [VehicleController::class, 'available']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
Route::post('/bookings/public', [BookingController::class, 'storePublic']);

// Settings (public read)
Route::get('/settings', [App\Http\Controllers\Api\SettingsController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);

    // Vehicles (create, update, delete require auth)
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    // Bookings (protected)
    Route::apiResource('bookings', BookingController::class);
    Route::get('/bookings/mine', [BookingController::class, 'mine']);
    Route::post('/bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    
    // Public booking creation (for checkout)
    Route::post('/bookings/public', [BookingController::class, 'storePublic']);

    // Rentals
    Route::apiResource('rentals', RentalController::class);
    Route::post('/bookings/{id}/checkout', [RentalController::class, 'checkout']);
    Route::post('/rentals/{id}/return', [RentalController::class, 'returnVehicle']);

    // Admin-only settings endpoints
    Route::post('/settings/hero-image', [App\Http\Controllers\Api\SettingsController::class, 'updateHeroImage']);
    Route::delete('/settings/hero-image', [App\Http\Controllers\Api\SettingsController::class, 'deleteHeroImage']);
});
