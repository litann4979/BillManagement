<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteVisitController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'email_collected' => 'nullable|email|max:255',
            'phone_collected' => 'nullable|string|max:20',
            'meter_bypass_photo' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'evidence_video' => 'nullable|file|mimes:mp4,mov,avi|max:51200',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'action_taken' => 'nullable|string|max:500',
            'status' => 'nullable|string|in:completed,pending,follow_up',
        ]);

        $photoPath = null;
        $videoPath = null;

        if ($request->hasFile('meter_bypass_photo')) {
            $photoPath = $request->file('meter_bypass_photo')
                ->store('site-visits/photos', 'public');
        }

        if ($request->hasFile('evidence_video')) {
            $videoPath = $request->file('evidence_video')
                ->store('site-visits/videos', 'public');
        }

        $visit = SiteVisit::create([
            'consumer_id' => $request->consumer_id,
            'email_collected' => $request->email_collected,
            'phone_collected' => $request->phone_collected,
            'meter_bypass_photo' => $photoPath,
            'evidence_video' => $videoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'action_taken' => $request->action_taken,
            'status' => $request->status ?? 'completed',
            'captured_by' => $request->user()->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Site visit recorded successfully',
            'data' => [
                'id' => $visit->id,
                'consumer_id' => $visit->consumer_id,
                'email_collected' => $visit->email_collected,
                'phone_collected' => $visit->phone_collected,
                'meter_bypass_photo' => $visit->meter_bypass_photo
                    ? Storage::url($visit->meter_bypass_photo)
                    : null,
                'evidence_video' => $visit->evidence_video
                    ? Storage::url($visit->evidence_video)
                    : null,
                'latitude' => $visit->latitude,
                'longitude' => $visit->longitude,
                'action_taken' => $visit->action_taken,
                'status' => $visit->status,
                'created_at' => $visit->created_at->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }
}
