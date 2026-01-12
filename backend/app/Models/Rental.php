<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    protected $fillable = [
        'booking_id',
        'checkout_time',
        'return_time',
        'odometer_out',
        'odometer_in',
        'fuel_out',
        'fuel_in',
        'status',
    ];

    protected $casts = [
        'checkout_time' => 'datetime',
        'return_time' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
