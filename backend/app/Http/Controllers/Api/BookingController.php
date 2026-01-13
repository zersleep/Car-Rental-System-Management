<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bookings = Booking::with('vehicle')->get();
        return response()->json($bookings);
    }

    /**
     * List bookings for the authenticated customer only.
     */
    public function mine(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Customer') {
            return response()->json([], 200);
        }

        // Resolve customer_id for this user
        $customerId = DB::table('customers')->where('user_id', $user->id)->value('id');
        if (!$customerId && $user->email) {
            $customerId = DB::table('customers')->where('email', $user->email)->value('id');
        }

        if (!$customerId) {
            return response()->json([], 200);
        }

        $bookings = Booking::with('vehicle')
            ->where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Store a newly created resource in storage (public).
     */
    public function storePublic(Request $request)
    {
        return $this->store($request);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'total_price' => 'required|numeric|min:0',
            'customer_info' => 'required|array',
            'customer_info.full_name' => 'required|string',
            'customer_info.email' => 'required|email',
            'customer_info.phone' => 'required|string',
            'customer_info.address' => 'required|string',
            'customer_info.city' => 'required|string',
            'customer_info.state' => 'required|string',
            'customer_info.zip_code' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            // Check if vehicle is available
            $vehicle = Vehicle::findOrFail($request->vehicle_id);
            if ($vehicle->status !== 'Available') {
                return response()->json(
                    ['message' => 'Vehicle is not available for booking'],
                    400
                );
            }

            // Create or get customer
            $customer = DB::table('customers')->where('email', $request->customer_info['email'])->first();
            if (!$customer) {
                $customerId = DB::table('customers')->insertGetId([
                    'full_name' => $request->customer_info['full_name'],
                    'email' => $request->customer_info['email'],
                    'phone' => $request->customer_info['phone'],
                    'created_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
            }

            // Create booking
            $booking = Booking::create([
                'customer_id' => $customerId,
                'vehicle_id' => $request->vehicle_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_price' => $request->total_price,
                'status' => 'Confirmed',
            ]);

            // Update vehicle status to Reserved
            $vehicle->update(['status' => 'Reserved']);

            DB::commit();

            return response()->json($booking, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                ['message' => 'Failed to create booking: ' . $e->getMessage()],
                500
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $booking = Booking::with('vehicle')->findOrFail($id);
        return response()->json($booking);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $booking = Booking::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|in:Pending,Confirmed,Cancelled,Expired',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
        ]);

        $booking->update($request->only(['status', 'start_date', 'end_date']));

        return response()->json($booking);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $booking = Booking::findOrFail($id);
        
        // Update vehicle status back to Available if booking is cancelled
        if ($booking->vehicle) {
            $booking->vehicle->update(['status' => 'Available']);
        }
        
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }

    /**
     * Approve a booking (Staff action)
     */
    public function approve(string $id)
    {
        $booking = Booking::findOrFail($id);
        
        if ($booking->status !== 'Pending') {
            return response()->json(
                ['message' => 'Only pending bookings can be approved'],
                400
            );
        }

        DB::beginTransaction();
        try {
            $booking->update(['status' => 'Confirmed']);
            if ($booking->vehicle) {
                $booking->vehicle->update(['status' => 'Reserved']);
            }
            DB::commit();
            return response()->json($booking);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to approve booking'], 500);
        }
    }

    /**
     * Cancel a booking (Customer/Staff action)
     */
    public function cancel(string $id)
    {
        $booking = Booking::findOrFail($id);
        
        if (!in_array($booking->status, ['Pending', 'Confirmed'])) {
            return response()->json(
                ['message' => 'Only pending or confirmed bookings can be cancelled'],
                400
            );
        }

        DB::beginTransaction();
        try {
            $booking->update(['status' => 'Cancelled']);
            if ($booking->vehicle && $booking->vehicle->status === 'Reserved') {
                $booking->vehicle->update(['status' => 'Available']);
            }
            DB::commit();
            return response()->json($booking);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel booking'], 500);
        }
    }
}
