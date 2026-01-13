# Database Seeding Instructions

To populate your database with sample data, run the following command:

```bash
php artisan db:seed
```

Or to run specific seeders:

```bash
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=VehicleSeeder
php artisan db:seed --class=CustomerSeeder
php artisan db:seed --class=BookingSeeder
php artisan db:seed --class=RentalSeeder
```

## Default Login Credentials

After seeding, you can login with:

**Admin:**
- Email: `admin@carrental.com`
- Password: `password123`

**Staff:**
- Email: `staff@carrental.com`
- Password: `password123`

**Customer:**
- Email: `customer@carrental.com`
- Password: `password123`

## What Gets Seeded

1. **Users**: Admin, Staff, and Customer accounts
2. **Vehicles**: 20+ vehicles with various statuses (Available, Reserved, Rented, Maintenance)
3. **Customers**: 8 customer records (one linked to the customer user)
4. **Bookings**: 
   - Today's pickups (Pending/Confirmed)
   - Today's returns (CheckedOut, ending today)
   - Overdue rentals (CheckedOut, past return date)
   - Recent completed bookings
   - Future bookings
5. **Rentals**: Active rentals for checked-out bookings

## Resetting Database

To reset and reseed:

```bash
php artisan migrate:fresh --seed
```

**Warning**: This will delete all existing data!
