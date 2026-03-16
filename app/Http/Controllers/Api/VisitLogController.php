<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitLog;
use App\Models\VisitPlan;
use Illuminate\Http\Request;

class VisitLogController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'visit_plan_id' => 'required|exists:visit_plans,id',
            'consumer_id' => 'required|exists:consumers,id',
            'visit_time' => 'required|date',
            'remarks' => 'nullable|string|max:1000',
            'visit_result' => 'nullable|string|max:255',
        ]);

        $plan = VisitPlan::where('billcollector_id', $request->user()->id)
            ->find($request->visit_plan_id);

        if (!$plan) {
            return response()->json([
                'status' => false,
                'message' => 'Visit plan not found or does not belong to you.',
            ], 404);
        }

        // Store only the date part for visit_date to avoid timezone shifts
        $visitDate = substr($request->visit_time, 0, 10);

        $log = VisitLog::create([
            'plan_id' => $plan->id,
            'consumer_id' => $request->consumer_id,
            'visit_date' => $visitDate,
            'visit_result' => $request->visit_result ?? $request->remarks,
            'remarks' => $request->remarks,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Visit recorded.',
            'data' => [
                'id' => $log->id,
                'plan_id' => $log->plan_id,
                'consumer_id' => $log->consumer_id,
                'visit_date' => optional($log->visit_date)->format('Y-m-d'),
                'visit_result' => $log->visit_result,
                'remarks' => $log->remarks,
                'created_by' => $log->created_by,
            ],
        ], 201);
    }
}
