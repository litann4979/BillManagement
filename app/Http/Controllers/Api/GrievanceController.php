<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grievance;
use Illuminate\Http\Request;

class GrievanceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'complaint_type' => 'required|string|max:100',
            'description' => 'required|string|max:2000',
        ]);

        $grievance = Grievance::create([
            'consumer_id' => $request->consumer_id,
            'complaint_type' => $request->complaint_type,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Grievance registered successfully',
            'data' => [
                'id' => $grievance->id,
                'consumer_id' => $grievance->consumer_id,
                'complaint_type' => $grievance->complaint_type,
                'description' => $grievance->description,
                'status' => $grievance->status,
                'created_at' => $grievance->created_at->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }
}
