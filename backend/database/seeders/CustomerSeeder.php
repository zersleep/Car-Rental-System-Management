<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Get customer user
        $customerUser = DB::table('users')->where('email', 'customer@carrental.com')->first();
        
        $customers = [
            [
                'full_name' => 'John Doe',
                'email' => 'customer@carrental.com',
                'phone' => '+1-555-0101',
                'user_id' => $customerUser ? $customerUser->id : null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'John Smith',
                'email' => 'john.smith@carrental.com',
                'phone' => '+1-555-0102',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@carrental.com',
                'phone' => '+1-555-0103',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Michael Brown',
                'email' => 'michael.brown@carrental.com',
                'phone' => '+1-555-0104',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Emily Davis',
                'email' => 'emily.davis@carrental.com',
                'phone' => '+1-555-0105',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'David Wilson',
                'email' => 'david.wilson@carrental.com',
                'phone' => '+1-555-0106',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@carrental.com',
                'phone' => '+1-555-0107',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Robert Taylor',
                'email' => 'robert.taylor@carrental.com',
                'phone' => '+1-555-0108',
                'user_id' => null,
                'created_at' => now(),
            ],
            [
                'full_name' => 'Jennifer Martinez',
                'email' => 'jennifer.martinez@carrental.com',
                'phone' => '+1-555-0109',
                'user_id' => null,
                'created_at' => now(),
            ],
        ];

        foreach ($customers as $customer) {
            DB::table('customers')->insert($customer);
        }
    }
}
