<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Vehicle;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Get customer IDs
        $customers = DB::table('customers')->pluck('id')->toArray();
        $vehicles = Vehicle::all();

        if (empty($customers) || $vehicles->isEmpty()) {
            return;
        }

        $today = Carbon::today();
        
        $bookings = [
            // Today's pickups (Pending/Confirmed)
            [
                'customer_id' => $customers[0],
                'vehicle_id' => $vehicles[0]->id,
                'start_date' => $today->toDateString(),
                'end_date' => $today->copy()->addDays(3)->toDateString(),
                'total_price' => $vehicles[0]->rental_price * 3,
                'status' => 'Pending',
                'created_at' => now(),
            ],
            [
                'customer_id' => $customers[1],
                'vehicle_id' => $vehicles[1]->id,
                'start_date' => $today->toDateString(),
                'end_date' => $today->copy()->addDays(5)->toDateString(),
                'total_price' => $vehicles[1]->rental_price * 5,
                'status' => 'Confirmed',
                'created_at' => now(),
            ],
            [
                'customer_id' => $customers[2],
                'vehicle_id' => $vehicles[2]->id,
                'start_date' => $today->toDateString(),
                'end_date' => $today->copy()->addDays(2)->toDateString(),
                'total_price' => $vehicles[2]->rental_price * 2,
                'status' => 'Confirmed',
                'created_at' => now(),
            ],
            // Today's returns (Active rentals ending today)
            [
                'customer_id' => $customers[3],
                'vehicle_id' => $vehicles[3]->id,
                'start_date' => $today->copy()->subDays(3)->toDateString(),
                'end_date' => $today->toDateString(),
                'total_price' => $vehicles[3]->rental_price * 3,
                'status' => 'CheckedOut',
                'created_at' => $today->copy()->subDays(3),
            ],
            [
                'customer_id' => $customers[4],
                'vehicle_id' => $vehicles[4]->id,
                'start_date' => $today->copy()->subDays(7)->toDateString(),
                'end_date' => $today->toDateString(),
                'total_price' => $vehicles[4]->rental_price * 7,
                'status' => 'CheckedOut',
                'created_at' => $today->copy()->subDays(7),
            ],
            // Overdue rentals (past return date)
            [
                'customer_id' => $customers[5],
                'vehicle_id' => $vehicles[5]->id,
                'start_date' => $today->copy()->subDays(10)->toDateString(),
                'end_date' => $today->copy()->subDays(2)->toDateString(),
                'total_price' => $vehicles[5]->rental_price * 8,
                'status' => 'CheckedOut',
                'created_at' => $today->copy()->subDays(10),
            ],
            [
                'customer_id' => $customers[6],
                'vehicle_id' => $vehicles[6]->id ?? $vehicles[0]->id,
                'start_date' => $today->copy()->subDays(5)->toDateString(),
                'end_date' => $today->copy()->subDays(1)->toDateString(),
                'total_price' => ($vehicles[6]->rental_price ?? $vehicles[0]->rental_price) * 4,
                'status' => 'CheckedOut',
                'created_at' => $today->copy()->subDays(5),
            ],
            // Recent completed bookings
            [
                'customer_id' => $customers[0],
                'vehicle_id' => $vehicles[0]->id,
                'start_date' => $today->copy()->subDays(15)->toDateString(),
                'end_date' => $today->copy()->subDays(10)->toDateString(),
                'total_price' => $vehicles[0]->rental_price * 5,
                'status' => 'Returned',
                'created_at' => $today->copy()->subDays(15),
            ],
            [
                'customer_id' => $customers[1],
                'vehicle_id' => $vehicles[1]->id,
                'start_date' => $today->copy()->subDays(20)->toDateString(),
                'end_date' => $today->copy()->subDays(15)->toDateString(),
                'total_price' => $vehicles[1]->rental_price * 5,
                'status' => 'Returned',
                'created_at' => $today->copy()->subDays(20),
            ],
            // Future bookings
            [
                'customer_id' => $customers[2],
                'vehicle_id' => $vehicles[2]->id,
                'start_date' => $today->copy()->addDays(5)->toDateString(),
                'end_date' => $today->copy()->addDays(8)->toDateString(),
                'total_price' => $vehicles[2]->rental_price * 3,
                'status' => 'Confirmed',
                'created_at' => now(),
            ],
        ];

        foreach ($bookings as $booking) {
            $created = Booking::create($booking);
            
            // Update vehicle status based on booking status
            $vehicle = Vehicle::find($booking['vehicle_id']);
            if ($vehicle) {
                if (in_array($booking['status'], ['Pending', 'Confirmed'])) {
                    $vehicle->update(['status' => 'Reserved']);
                } elseif ($booking['status'] === 'CheckedOut') {
                    $vehicle->update(['status' => 'Rented']);
                }
            }
        }
    }
}
