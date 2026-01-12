<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Convert legacy Manager records to Staff and update enum accordingly
        DB::statement("UPDATE users SET role = 'Staff' WHERE role = 'Manager'");
        // Alter enum - MySQL-specific; adjust as needed for your DB
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Staff','Customer') NOT NULL DEFAULT 'Customer'");
    }

    public function down()
    {
        // Revert enum to include Manager again
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Staff','Manager','Customer') NOT NULL DEFAULT 'Customer'");
        // This does not revert role data changes for Manager->Staff
    }
};
