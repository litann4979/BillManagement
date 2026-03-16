<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitPlan;
use App\Models\VisitPlanConsumer;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CollectorVisitPlanController extends Controller
{
    public function index(Request $request)
    {
        $query = VisitPlan::where('billcollector_id', $request->user()->id)
            ->withCount('consumers')
            ->withCount(['visitLogs as visited_count'])
            ->orderByDesc('plan_date');

        if ($request->filled('date')) {
            $query->whereDate('plan_date', $request->date);
        }

        $plans = $query->paginate(15);

        return response()->json([
            'status' => true,
            'data' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'visit_date' => 'required|date',
            'visit_time' => 'nullable|date_format:H:i',
        ]);

        $plan = VisitPlan::create([
            'billcollector_id' => $request->user()->id,
            'plan_date' => $request->visit_date,
            'visit_time' => $request->visit_time,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Visit plan created.',
            'data' => $plan,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $plan = VisitPlan::where('billcollector_id', $request->user()->id)
            ->withCount('consumers')
            ->withCount(['visitLogs as visited_count'])
            ->with([
                'consumers.consumer:id,scno,name,phone,village_id',
                'consumers.consumer.village:id,name',
                'consumers.consumer.arrear:id,consumer_id,total_arrear,months_due',
                'visitLogs:id,plan_id,consumer_id,visit_date,visit_result,remarks',
            ])
            ->find($id);

        if (!$plan) {
            return response()->json([
                'status' => false,
                'message' => 'Visit plan not found.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $plan,
        ]);
    }

    public function update(Request $request, $id)
    {
        $plan = VisitPlan::where('billcollector_id', $request->user()->id)->find($id);

        if (!$plan) {
            return response()->json([
                'status' => false,
                'message' => 'Visit plan not found.',
            ], 404);
        }

        $request->validate([
            'visit_date' => 'sometimes|date',
            'visit_time' => 'nullable|date_format:H:i',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
        ]);

        $plan->update(array_filter([
            'plan_date' => $request->visit_date,
            'visit_time' => $request->visit_time,
            'status' => $request->status,
        ], fn ($v) => $v !== null));

        return response()->json([
            'status' => true,
            'message' => 'Visit plan updated.',
            'data' => $plan->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $plan = VisitPlan::where('billcollector_id', $request->user()->id)->find($id);

        if (!$plan) {
            return response()->json([
                'status' => false,
                'message' => 'Visit plan not found.',
            ], 404);
        }

        $plan->delete();

        return response()->json([
            'status' => true,
            'message' => 'Visit plan deleted.',
        ]);
    }

    public function addConsumers(Request $request, $planId)
    {
        $plan = VisitPlan::where('billcollector_id', $request->user()->id)->find($planId);

        if (!$plan) {
            return response()->json([
                'status' => false,
                'message' => 'Visit plan not found.',
            ], 404);
        }

        $request->validate([
            'consumer_ids' => 'required|array|min:1',
            'consumer_ids.*' => 'exists:consumers,id',
        ]);

        $existing = $plan->consumers()->pluck('consumer_id')->toArray();
        $new = array_diff($request->consumer_ids, $existing);

        $rows = array_map(fn ($cid) => [
            'plan_id' => $plan->id,
            'consumer_id' => $cid,
            'created_at' => now(),
            'updated_at' => now(),
        ], $new);

        if ($rows) {
            VisitPlanConsumer::insert($rows);
        }

        $skipped = count($request->consumer_ids) - count($new);

        return response()->json([
            'status' => true,
            'message' => count($new) . ' consumer(s) added.' . ($skipped > 0 ? " {$skipped} duplicate(s) skipped." : ''),
            'added' => count($new),
            'skipped' => $skipped,
        ]);
    }

    public function todayVisits(Request $request)
    {
        $plan = VisitPlan::where('billcollector_id', $request->user()->id)
            ->whereDate('plan_date', Carbon::today())
            ->with([
                'consumers.consumer:id,scno,name,phone,village_id',
                'consumers.consumer.village:id,name',
                'consumers.consumer.arrear:id,consumer_id,total_arrear,months_due',
            ])
            ->withCount('consumers')
            ->withCount(['visitLogs as visited_count'])
            ->first();

        if (!$plan) {
            return response()->json([
                'status' => true,
                'message' => 'No visit plan for today.',
                'data' => null,
            ]);
        }

        $consumers = $plan->consumers->map(function ($vpc) {
            $c = $vpc->consumer;
            return [
                'id' => $c->id,
                'name' => $c->name,
                'scno' => $c->scno,
                'phone' => $c->phone,
                'village' => $c->village->name ?? null,
                'arrear_amount' => $c->arrear->total_arrear ?? 0,
                'months_due' => $c->arrear->months_due ?? 0,
            ];
        });

        return response()->json([
            'status' => true,
            'data' => [
                'plan_id' => $plan->id,
                'visit_date' => $plan->plan_date->format('Y-m-d'),
                'visit_time' => $plan->visit_time,
                'status' => $plan->status,
                'total_consumers' => $plan->consumers_count,
                'visited' => $plan->visited_count,
                'consumers' => $consumers,
            ],
        ]);
    }
}
