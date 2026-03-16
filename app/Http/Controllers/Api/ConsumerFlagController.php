<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsumerFlag;
use Illuminate\Http\Request;

class ConsumerFlagController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'flag_type' => 'required|string|in:meter_bypass,disconnected,suspicious_activity,illegal_connection',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $flag = ConsumerFlag::create([
            'consumer_id' => $request->consumer_id,
            'flag_type' => $request->flag_type,
            'remarks' => $request->remarks,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Consumer flagged successfully',
            'data' => [
                'id' => $flag->id,
                'consumer_id' => $flag->consumer_id,
                'flag_type' => $flag->flag_type,
                'remarks' => $flag->remarks,
                'created_at' => $flag->created_at->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }
}
