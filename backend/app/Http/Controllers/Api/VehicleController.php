<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::all();
        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string|max:20|unique:vehicles',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'rental_price' => 'required|numeric|min:0',
            'status' => 'nullable|in:Available,Reserved,Rented,Maintenance,Retired',
            'image' => 'nullable|string'
        ]);

        $vehicle = Vehicle::create($request->all());

        return response()->json($vehicle, 201);
    }

    public function show($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        return response()->json($vehicle);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'plate_number' => 'sometimes|string|max:20|unique:vehicles,plate_number,' . $id,
            'brand' => 'sometimes|string|max:50',
            'model' => 'sometimes|string|max:50',
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'rental_price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:Available,Reserved,Rented,Maintenance,Retired',
            'image' => 'nullable|string'
        ]);

        $vehicle->update($request->all());

        return response()->json($vehicle);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    public function available()
    {
        $vehicles = Vehicle::where('status', 'Available')->get();
        return response()->json($vehicles);
    }
}
