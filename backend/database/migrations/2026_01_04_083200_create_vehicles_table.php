<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number', 20)->unique();
            $table->string('brand', 50);
            $table->string('model', 50);
            $table->integer('year');
            $table->enum('status', ['Available', 'Reserved', 'Rented', 'Maintenance', 'Retired'])->default('Available');
            $table->decimal('rental_price', 10, 2);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
