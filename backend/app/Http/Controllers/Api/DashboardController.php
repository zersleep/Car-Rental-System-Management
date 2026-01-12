<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Rental;
use App\Models\Vehicle;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Admin') {
            // Summary
            $summary = [
                'total_vehicles' => Vehicle::count(),
                'total_bookings' => Booking::count(),
                'available_vehicles' => Vehicle::where('status', 'Available')->count(),
                'active_rentals' => Rental::where('status', 'Active')->count(),
            ];

            // Recent bookings (10)
            $recentBookings = Booking::with([
                'vehicle:id,brand,model',
                'customer:id,full_name',
            ])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date', 'created_at']);

            // Vehicle status breakdown
            $vehicleStatus = Vehicle::select('status', DB::raw('count(*) as total'))
                ->whereIn('status', ['Available', 'Rented', 'Maintenance'])
                ->groupBy('status')
                ->get();

            return response()->json([
                'role' => $user->role,
                'summary' => $summary,
                'recent_bookings' => $recentBookings,
                'vehicle_status' => $vehicleStatus,
            ]);
        }

        if ($user->role === 'Staff') {
            $today = now()->toDateString();

            $todayPickups = Booking::with([
                'customer:id,full_name',
                'vehicle:id,brand,model,plate_number',
            ])
                ->whereDate('start_date', $today)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->orderBy('start_date')
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date']);

            $todayReturns = Rental::with([
                'booking.customer:id,full_name',
                'booking.vehicle:id,brand,model,plate_number',
            ])
                ->where('status', 'Active')
                ->whereHas('booking', function ($q) use ($today) {
                    $q->whereDate('end_date', $today);
                })
                ->orderBy('checkout_time')
                ->get(['id', 'booking_id', 'checkout_time', 'return_time', 'status']);

            $overdueRentals = Rental::with([
                'booking.customer:id,full_name',
                'booking.vehicle:id,brand,model,plate_number',
            ])
                ->where('status', 'Active')
                ->whereHas('booking', function ($q) use ($today) {
                    $q->whereDate('end_date', '<', $today);
                })
                ->orderBy('checkout_time')
                ->get(['id', 'booking_id', 'checkout_time', 'return_time', 'status']);

            return response()->json([
                'role' => 'Staff',
                'today_pickups' => $todayPickups,
                'today_returns' => $todayReturns,
                'overdue_rentals' => $overdueRentals,
                'counts' => [
                    'today_pickups' => $todayPickups->count(),
                    'today_returns' => $todayReturns->count(),
                    'overdue_rentals' => $overdueRentals->count(),
                ],
            ]);
        }

        if ($user->role === 'Customer') {
            // Resolve customer_id from customers table
            $customerId = DB::table('customers')
                ->where('user_id', $user->id)
                ->value('id');

            // Fallback: match by email if user-linked record not found
            if (!$customerId && $user->email) {
                $customerId = DB::table('customers')
                    ->where('email', $user->email)
                    ->value('id');
            }

            if (!$customerId) {
                return response()->json([
                    'role' => 'Customer',
                    'active_booking' => null,
                    'booking_history' => [],
                ]);
            }

            $activeBooking = Booking::with('vehicle:id,brand,model,plate_number')
                ->where('customer_id', $customerId)
                ->whereIn('status', ['Pending', 'Confirmed', 'CheckedOut'])
                ->orderByDesc('start_date')
                ->first(['id', 'vehicle_id', 'start_date', 'end_date', 'status']);

            $bookingHistory = Booking::with('vehicle:id,brand,model,plate_number')
                ->where('customer_id', $customerId)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'vehicle_id', 'start_date', 'end_date', 'status', 'created_at']);

            return response()->json([
                'role' => 'Customer',
                'active_booking' => $activeBooking,
                'booking_history' => $bookingHistory,
            ]);
        }

        return response()->json(['message' => 'No dashboard data available for this role.'], 404);
    }
}
