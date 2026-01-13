<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->timestamp('checkout_time')->nullable();
            $table->timestamp('return_time')->nullable();
            $table->integer('odometer_out')->nullable();
            $table->integer('odometer_in')->nullable();
            $table->integer('fuel_out')->nullable();
            $table->integer('fuel_in')->nullable();
            $table->enum('status', ['Active', 'Returned'])->default('Active');
            $table->timestamps();
            
            $table->foreign('booking_id')->references('id')->on('bookings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
