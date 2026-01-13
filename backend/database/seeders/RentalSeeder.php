<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Rental;
use App\Models\Booking;
use Carbon\Carbon;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        
        // Get bookings that are checked out (for today's returns and overdue)
        $checkedOutBookings = Booking::where('status', 'CheckedOut')
            ->whereDate('end_date', '<=', $today)
            ->get();

        foreach ($checkedOutBookings as $booking) {
            // Create rental for checked out bookings
            $rental = Rental::firstOrCreate(
                ['booking_id' => $booking->id],
                [
                    'checkout_time' => $booking->start_date,
                    'status' => 'Active',
                ]
            );
        }

        // Also create rentals for some active bookings ending today
        $todayReturns = Booking::where('status', 'CheckedOut')
            ->whereDate('end_date', $today)
            ->get();

        foreach ($todayReturns as $booking) {
            Rental::firstOrCreate(
                ['booking_id' => $booking->id],
                [
                    'checkout_time' => $booking->start_date,
                    'status' => 'Active',
                ]
            );
        }
    }
}
