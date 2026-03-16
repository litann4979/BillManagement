<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitLog;
use Illuminate\Http\Request;

class CollectorVisitHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = VisitLog::where('created_by', $request->user()->id)
            ->with([
                'consumer:id,scno,name,phone',
                'plan:id,plan_date,status',
            ])
            ->orderByDesc('visit_date');

        if ($request->filled('date')) {
            $query->whereDate('visit_date', $request->date);
        }

        if ($request->filled('consumer_id')) {
            $query->where('consumer_id', $request->consumer_id);
        }

        if ($request->filled('visit_plan_id')) {
            $query->where('plan_id', $request->visit_plan_id);
        }

        $logs = $query->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $logs,
        ]);
    }
}
