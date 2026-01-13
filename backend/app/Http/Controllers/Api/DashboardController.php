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
            $summary = [
                'total_vehicles' => Vehicle::count(),
                'total_bookings' => Booking::count(),
                'available_vehicles' => Vehicle::where('status', 'Available')->count(),
                'active_rentals' => Rental::where('status', 'Active')->count(),
            ];

            // Recent bookings (10) - load customer data manually
            $recentBookings = Booking::with('vehicle:id,brand,model')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date', 'created_at'])
                ->map(function ($booking) {
                    $customer = DB::table('customers')->where('id', $booking->customer_id)->first();
                    $booking->customer = $customer ? (object)['id' => $customer->id, 'full_name' => $customer->full_name] : null;
                    return $booking;
                });

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

            // Today's pickups - load customer manually
            $todayPickups = Booking::with('vehicle:id,brand,model,plate_number')
                ->whereDate('start_date', $today)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->orderBy('start_date')
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date'])
                ->map(function ($booking) {
                    $customer = DB::table('customers')->where('id', $booking->customer_id)->first();
                    $booking->customer = $customer ? (object)['id' => $customer->id, 'full_name' => $customer->full_name] : null;
                    return $booking;
                });

            // Today's returns - load booking and customer manually
            $todayReturns = Rental::with('booking.vehicle:id,brand,model,plate_number')
                ->where('status', 'Active')
                ->whereHas('booking', function ($q) use ($today) {
                    $q->whereDate('end_date', $today);
                })
                ->orderBy('checkout_time')
                ->get(['id', 'booking_id', 'checkout_time', 'return_time', 'status'])
                ->map(function ($rental) {
                    if ($rental->booking) {
                        $customer = DB::table('customers')->where('id', $rental->booking->customer_id)->first();
                        $rental->booking->customer = $customer ? (object)['id' => $customer->id, 'full_name' => $customer->full_name] : null;
                    }
                    return $rental;
                });

            // Overdue rentals - load booking and customer manually
            $overdueRentals = Rental::with('booking.vehicle:id,brand,model,plate_number')
                ->where('status', 'Active')
                ->whereHas('booking', function ($q) use ($today) {
                    $q->whereDate('end_date', '<', $today);
                })
                ->orderBy('checkout_time')
                ->get(['id', 'booking_id', 'checkout_time', 'return_time', 'status'])
                ->map(function ($rental) {
                    if ($rental->booking) {
                        $customer = DB::table('customers')->where('id', $rental->booking->customer_id)->first();
                        $rental->booking->customer = $customer ? (object)['id' => $customer->id, 'full_name' => $customer->full_name] : null;
                    }
                    return $rental;
                });

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

            // If still no customer, create one for this user
            if (!$customerId) {
                $customerId = DB::table('customers')->insertGetId([
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'phone' => null,
                    'user_id' => $user->id,
                    'created_at' => now(),
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
