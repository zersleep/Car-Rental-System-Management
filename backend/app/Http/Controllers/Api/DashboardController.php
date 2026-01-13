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
                'pending_bookings' => Booking::where('status', 'Pending')->count(),
                'total_customers' => DB::table('customers')->count(),
            ];

            // Revenue calculations
            $totalRevenue = Booking::whereIn('status', ['Confirmed', 'CheckedOut', 'Returned'])
                ->sum('total_price');
            $monthlyRevenue = Booking::whereIn('status', ['Confirmed', 'CheckedOut', 'Returned'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_price');
            $todayRevenue = Booking::whereIn('status', ['Confirmed', 'CheckedOut', 'Returned'])
                ->whereDate('created_at', now()->toDateString())
                ->sum('total_price');

            // Recent bookings (10) - load customer data manually
            $recentBookings = Booking::with('vehicle:id,brand,model')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date', 'total_price', 'created_at'])
                ->map(function ($booking) {
                    $customer = DB::table('customers')->where('id', $booking->customer_id)->first();
                    $booking->customer = $customer ? (object)['id' => $customer->id, 'full_name' => $customer->full_name] : null;
                    return $booking;
                });

            // Vehicle status breakdown
            $vehicleStatus = Vehicle::select('status', DB::raw('count(*) as total'))
                ->whereIn('status', ['Available', 'Rented', 'Maintenance', 'Reserved'])
                ->groupBy('status')
                ->get();

            // Booking status breakdown
            $bookingStatus = Booking::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get();

            // Top customers by bookings
            $topCustomers = DB::table('bookings')
                ->join('customers', 'bookings.customer_id', '=', 'customers.id')
                ->select('customers.id', 'customers.full_name', 'customers.email', DB::raw('count(*) as booking_count'), DB::raw('sum(bookings.total_price) as total_spent'))
                ->groupBy('customers.id', 'customers.full_name', 'customers.email')
                ->orderByDesc('booking_count')
                ->limit(5)
                ->get();

            return response()->json([
                'role' => $user->role,
                'summary' => $summary,
                'revenue' => [
                    'total' => $totalRevenue,
                    'monthly' => $monthlyRevenue,
                    'today' => $todayRevenue,
                ],
                'recent_bookings' => $recentBookings,
                'vehicle_status' => $vehicleStatus,
                'booking_status' => $bookingStatus,
                'top_customers' => $topCustomers,
            ]);
        }

        if ($user->role === 'Staff') {
            $today = now()->toDateString();

            // Pending bookings count
            $pendingBookings = Booking::where('status', 'Pending')->count();

            // Today's pickups - load customer with contact info
            $todayPickups = Booking::with('vehicle:id,brand,model,plate_number')
                ->whereDate('start_date', $today)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->orderBy('start_date')
                ->get(['id', 'customer_id', 'vehicle_id', 'status', 'start_date', 'end_date', 'total_price'])
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

            // Today's returns - load booking and customer with contact info
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
                        $rental->booking->customer = $customer ? (object)[
                            'id' => $customer->id,
                            'full_name' => $customer->full_name,
                            'email' => $customer->email,
                            'phone' => $customer->phone,
                        ] : null;
                    }
                    return $rental;
                });

            // Overdue rentals - load booking and customer with contact info
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
                        $rental->booking->customer = $customer ? (object)[
                            'id' => $customer->id,
                            'full_name' => $customer->full_name,
                            'email' => $customer->email,
                            'phone' => $customer->phone,
                        ] : null;
                    }
                    return $rental;
                });

            // Today's revenue
            $todayRevenue = Booking::whereIn('status', ['Confirmed', 'CheckedOut', 'Returned'])
                ->whereDate('created_at', $today)
                ->sum('total_price');

            return response()->json([
                'role' => 'Staff',
                'today_pickups' => $todayPickups,
                'today_returns' => $todayReturns,
                'overdue_rentals' => $overdueRentals,
                'counts' => [
                    'today_pickups' => $todayPickups->count(),
                    'today_returns' => $todayReturns->count(),
                    'overdue_rentals' => $overdueRentals->count(),
                    'pending_bookings' => $pendingBookings,
                ],
                'today_revenue' => $todayRevenue,
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
