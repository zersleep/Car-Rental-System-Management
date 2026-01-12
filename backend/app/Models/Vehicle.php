<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'plate_number',
        'brand',
        'model',
        'year',
        'status',
        'rental_price',
        'image',
    ];

    protected $casts = [
        'year' => 'integer',
        'rental_price' => 'decimal:2',
    ];
}
