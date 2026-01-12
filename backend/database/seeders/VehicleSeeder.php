<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'plate_number' => 'ABC-1234',
                'brand' => 'Tesla',
                'model' => 'Model 3',
                'year' => 2023,
                'status' => 'Available',
                'rental_price' => 89.00,
                'image' => null,
            ],
            [
                'plate_number' => 'XYZ-5678',
                'brand' => 'Porsche',
                'model' => '911',
                'year' => 2024,
                'status' => 'Available',
                'rental_price' => 299.00,
                'image' => null,
            ],
            [
                'plate_number' => 'DEF-9012',
                'brand' => 'Range Rover',
                'model' => 'Sport',
                'year' => 2023,
                'status' => 'Available',
                'rental_price' => 159.00,
                'image' => null,
            ],
            [
                'plate_number' => 'GHI-3456',
                'brand' => 'Toyota',
                'model' => 'Camry',
                'year' => 2022,
                'status' => 'Available',
                'rental_price' => 49.00,
                'image' => null,
            ],
            [
                'plate_number' => 'JKL-7890',
                'brand' => 'BMW',
                'model' => 'X5',
                'year' => 2023,
                'status' => 'Rented',
                'rental_price' => 129.00,
                'image' => null,
            ],
            [
                'plate_number' => 'MNO-1122',
                'brand' => 'Audi',
                'model' => 'Q7',
                'year' => 2024,
                'status' => 'Available',
                'rental_price' => 139.00,
                'image' => null,
            ],
            [
                'plate_number' => 'PQR-3344',
                'brand' => 'Mercedes-Benz',
                'model' => 'E220d',
                'year' => 2023,
                'status' => 'Available',
                'rental_price' => 120.00,
                'image' => null,
            ],
            [
                'plate_number' => 'STU-5566',
                'brand' => 'Honda',
                'model' => 'Civic',
                'year' => 2022,
                'status' => 'Available',
                'rental_price' => 45.00,
                'image' => null,
            ],
            [
                'plate_number' => 'VWX-7788',
                'brand' => 'Ford',
                'model' => 'Explorer',
                'year' => 2023,
                'status' => 'Available',
                'rental_price' => 95.00,
                'image' => null,
            ],
            [
                'plate_number' => 'YZA-9900',
                'brand' => 'Chevrolet',
                'model' => 'Tahoe',
                'year' => 2023,
                'status' => 'Maintenance',
                'rental_price' => 110.00,
                'image' => null,
            ],
            [
                'plate_number' => 'BOS-2468',
                'brand' => 'Hyundai',
                'model' => 'Tucson',
                'year' => 2023,
                'status' => 'Available',
                'rental_price' => 70.00,
                'image' => null,
            ],
            [
                'plate_number' => 'CHI-1357',
                'brand' => 'Kia',
                'model' => 'Sportage',
                'year' => 2024,
                'status' => 'Available',
                'rental_price' => 72.00,
                'image' => null,
            ],
            [
                'plate_number' => 'NYC-8080',
                'brand' => 'Nissan',
                'model' => 'Altima',
                'year' => 2022,
                'status' => 'Reserved',
                'rental_price' => 55.00,
                'image' => null,
            ],
        ];

        foreach ($vehicles as $vehicleData) {
            Vehicle::create($vehicleData);
        }
    }
}
