<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = DB::table('customers')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $customer = DB::table('customers')->insertGetId([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'created_at' => now(),
        ]);

        $newCustomer = DB::table('customers')->where('id', $customer)->first();

        return response()->json($newCustomer, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = DB::table('customers')->where('id', $id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $customer = DB::table('customers')->where('id', $id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        DB::table('customers')
            ->where('id', $id)
            ->update([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

        $updatedCustomer = DB::table('customers')->where('id', $id)->first();

        return response()->json($updatedCustomer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = DB::table('customers')->where('id', $id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        // Check if customer has bookings
        $hasBookings = DB::table('bookings')->where('customer_id', $id)->exists();

        if ($hasBookings) {
            return response()->json(
                ['message' => 'Cannot delete customer with existing bookings'],
                400
            );
        }

        DB::table('customers')->where('id', $id)->delete();

        return response()->json(['message' => 'Customer deleted successfully']);
    }
}
