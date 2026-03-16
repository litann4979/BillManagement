<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnauthorizedConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UnauthorizedConnectionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'aadhaar_number' => ['nullable', 'string', 'max:20'],
            'aadhaar_photo' => ['nullable', 'image', 'max:5120'],
            'evidence_photo' => ['nullable', 'image', 'max:5120'],
            'evidence_video' => ['nullable', 'file', 'mimetypes:video/mp4,video/quicktime,video/x-msvideo', 'max:51200'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $basePath = 'unauthorized-connections';

        $aadhaarPhotoPath = null;
        $evidencePhotoPath = null;
        $evidenceVideoPath = null;

        if ($request->hasFile('aadhaar_photo')) {
            $aadhaarPhotoPath = $request->file('aadhaar_photo')
                ->store($basePath.'/aadhaar', 'public');
        }

        if ($request->hasFile('evidence_photo')) {
            $evidencePhotoPath = $request->file('evidence_photo')
                ->store($basePath.'/photos', 'public');
        }

        if ($request->hasFile('evidence_video')) {
            $evidenceVideoPath = $request->file('evidence_video')
                ->store($basePath.'/videos', 'public');
        }

        $report = UnauthorizedConnection::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'aadhaar_number' => $validated['aadhaar_number'] ?? null,
            'aadhaar_photo' => $aadhaarPhotoPath,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'evidence_photo' => $evidencePhotoPath,
            'evidence_video' => $evidenceVideoPath,
            'reported_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Unauthorized connection reported successfully',
            'data' => [
                'report_id' => $report->id,
                'status' => $report->status,
            ],
        ], 201);
    }
}

