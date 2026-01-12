<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    // Public settings (for homepage etc)
    public function index()
    {
        $hero = Setting::get('hero_image', null);
        $updated = Setting::get('hero_image_updated_at', null);
        return response()->json([ 'hero_image' => $hero, 'hero_image_updated_at' => $updated ]);
    }

    // Admin only: delete hero image (reset to default)
    public function deleteHeroImage(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Setting::set('hero_image', null);
        Setting::set('hero_image_updated_at', now()->toDateTimeString());

        return response()->json(['hero_image' => null, 'hero_image_updated_at' => now()->toDateTimeString()]);
    }

    // Admin only: upload a new hero image
    public function updateHeroImage(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Basic validation; we accept either an uploaded image or an external URL
        $request->validate([
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'external_url' => 'nullable|url',
        ]);

        if (!$request->hasFile('image') && !$request->filled('external_url')) {
            return response()->json([
                'message' => 'Please provide an image or an external URL for the hero.'
            ], 422);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('hero_images', 'public'); // storage/app/public/hero_images
            $urlPath = Storage::url($path); // usually /storage/hero_images/...

            // Ensure absolute URL so the frontend (running on a different host:port) can load it
            $appUrl = rtrim(config('app.url', ''), '/');
            if ($urlPath && str_starts_with($urlPath, '/')) {
                $url = $appUrl . $urlPath;
            } else {
                $url = $urlPath;
            }
        } else {
            $url = $request->input('external_url');
        }

        // Append a cache-busting query param server-side and persist the cache-busted URL
        $timestamp = strtotime(now());
        $separator = (strpos($url, '?') !== false) ? '&' : '?';
        $cbUrl = $url . $separator . 'v=' . $timestamp;

        Setting::set('hero_image', $cbUrl);
        Setting::set('hero_image_updated_at', now()->toDateTimeString());

        return response()->json(['hero_image' => $cbUrl, 'hero_image_updated_at' => now()->toDateTimeString()]);
    }
}
