<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\Booking;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RentalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rentals = Rental::with(['booking.vehicle', 'booking.customer'])->get();
        return response()->json($rentals);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rental = Rental::with(['booking.vehicle', 'booking.customer'])->findOrFail($id);
        return response()->json($rental);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Checkout a vehicle (Staff action)
     */
    public function checkout(string $id, Request $request)
    {
        $booking = Booking::findOrFail($id);
        
        if (!in_array($booking->status, ['Pending', 'Confirmed'])) {
            return response()->json(
                ['message' => 'Only pending or confirmed bookings can be checked out'],
                400
            );
        }

        DB::beginTransaction();
        try {
            // Create rental
            $rental = Rental::create([
                'booking_id' => $booking->id,
                'checkout_time' => now(),
                'status' => 'Active',
            ]);

            // Update booking status
            $booking->update(['status' => 'CheckedOut']);

            // Update vehicle status
            if ($booking->vehicle) {
                $booking->vehicle->update(['status' => 'Rented']);
            }

            DB::commit();
            return response()->json($rental);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to checkout vehicle'], 500);
        }
    }

    /**
     * Return a vehicle (Staff action)
     */
    public function returnVehicle(string $id, Request $request)
    {
        $rental = Rental::findOrFail($id);
        
        if ($rental->status !== 'Active') {
            return response()->json(
                ['message' => 'Only active rentals can be returned'],
                400
            );
        }

        DB::beginTransaction();
        try {
            // Update rental
            $rental->update([
                'return_time' => now(),
                'status' => 'Returned',
            ]);

            // Update booking status
            if ($rental->booking) {
                $rental->booking->update(['status' => 'Returned']);
            }

            // Update vehicle status
            if ($rental->booking && $rental->booking->vehicle) {
                $rental->booking->vehicle->update(['status' => 'Available']);
            }

            DB::commit();
            return response()->json($rental);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to return vehicle'], 500);
        }
    }
}
