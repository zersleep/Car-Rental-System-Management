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
        $bookings = Booking::with('vehicle')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($booking) {
                $customer = DB::table('customers')->where('id', $booking->customer_id)->first();
                $booking->customer = $customer ? (object)[
                    'id' => $customer->id,
                    'full_name' => $customer->full_name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ] : null;
                return $booking;
            });
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

        // Gather ALL customer IDs linked to this user (by user_id OR by email)
        $customerIds = DB::table('customers')
            ->when($user->id, function ($q) use ($user) {
                $q->orWhere('user_id', $user->id);
            })
            ->when($user->email, function ($q) use ($user) {
                $q->orWhere('email', $user->email);
            })
            ->pluck('id')
            ->unique()
            ->values();

        if ($customerIds->isEmpty()) {
            return response()->json([]);
        }

        $bookings = Booking::with('vehicle')
            ->whereIn('customer_id', $customerIds)
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

            // Create or get customer (and try to link to existing user by email)
            $customerQuery = DB::table('customers')
                ->where('email', $request->customer_info['email']);

            $existingCustomer = $customerQuery->first();

            // Try to find a user with this email to link accounts
            $userId = DB::table('users')
                ->where('email', $request->customer_info['email'])
                ->value('id');

            if ($existingCustomer) {
                $customerId = $existingCustomer->id;
                // If we found a matching user and the customer has no user_id yet, link it
                if ($userId && !$existingCustomer->user_id) {
                    DB::table('customers')
                        ->where('id', $existingCustomer->id)
                        ->update(['user_id' => $userId]);
                }
            } else {
                $customerId = DB::table('customers')->insertGetId([
                    'full_name' => $request->customer_info['full_name'],
                    'email' => $request->customer_info['email'],
                    'phone' => $request->customer_info['phone'],
                    'user_id' => $userId,
                    'created_at' => now(),
                ]);
            }

            // Create booking as Pending so staff must approve
            $booking = Booking::create([
                'customer_id' => $customerId,
                'vehicle_id' => $request->vehicle_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_price' => $request->total_price,
                'status' => 'Pending',
            ]);

            // Immediately reserve the vehicle so others can't book the same dates
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
