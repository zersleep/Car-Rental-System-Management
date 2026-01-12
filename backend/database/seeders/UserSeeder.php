<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@carrental.com',
                'password' => Hash::make('password123'),
                'role' => 'Admin',
            ],
            [
                'name' => 'Staff User',
                'email' => 'staff@carrental.com',
                'password' => Hash::make('password123'),
                'role' => 'Staff',
            ],
            [
                'name' => 'John Doe',
                'email' => 'customer@carrental.com',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
