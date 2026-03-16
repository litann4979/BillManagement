<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dtr;
use App\Models\PromiseToPay;
use App\Models\Role;
use App\Models\Village;
use App\Models\VisitPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitManagementController extends Controller
{
    public function index(Request $request)
    {
        $billRole = Role::where('name', 'billcollector')->first();
        $billCollectors = $billRole
            ? User::where('role_id', $billRole->id)->select('id', 'name')->orderBy('name')->get()
            : collect([]);

        $villages = Village::select('id', 'name')->orderBy('name')->get();
        $dtrs = Dtr::select('id', 'dtr_name', 'dtr_code')->orderBy('dtr_name')->get();

        $planQuery = VisitPlan::with([
            'collector:id,name',
            'consumers.consumer:id,scno,name,phone,village_id,dtr_id',
            'consumers.consumer.village:id,name',
            'consumers.consumer.dtr:id,dtr_name',
        ])
        ->withCount(['consumers', 'visitLogs']);

        if ($request->filled('billcollector_id')) {
            $planQuery->where('billcollector_id', $request->billcollector_id);
        }

        if ($request->filled('date')) {
            $planQuery->whereDate('plan_date', $request->date);
        }

        if ($request->filled('village_id')) {
            $planQuery->whereHas('consumers.consumer', function ($q) use ($request) {
                $q->where('village_id', $request->village_id);
            });
        }

        if ($request->filled('dtr_id')) {
            $planQuery->whereHas('consumers.consumer', function ($q) use ($request) {
                $q->where('dtr_id', $request->dtr_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $planQuery->whereHas('consumers.consumer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('scno', 'like', "%{$search}%");
            });
        }

        $visitPlans = $planQuery->orderByDesc('plan_date')->paginate(15)->withQueryString();

        $promiseQuery = PromiseToPay::with([
            'consumer:id,scno,name',
            'creator:id,name',
        ]);

        if ($request->filled('billcollector_id')) {
            $promiseQuery->where('created_by', $request->billcollector_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $promiseQuery->whereHas('consumer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('scno', 'like', "%{$search}%");
            });
        }

        $promises = $promiseQuery->orderByDesc('promise_date')->paginate(15, ['*'], 'promise_page')->withQueryString();

        $visitLogsByPlan = [];
        foreach ($visitPlans->items() as $plan) {
            $visitLogsByPlan[$plan->id] = $plan->visitLogs()
                ->with([
                    'consumer:id,scno,name,phone,village_id,dtr_id',
                    'consumer.village:id,name',
                    'consumer.dtr:id,dtr_name',
                ])
                ->get()
                ->map(function ($log) {
                    $consumer = $log->consumer;

                    return [
                        'id' => $log->id,
                        'consumer_name' => $consumer->name ?? 'N/A',
                        'scno' => $consumer->scno ?? 'N/A',
                        'phone' => $consumer->phone ?? null,
                        'village' => $consumer?->village?->name ?? 'N/A',
                        'dtr' => $consumer?->dtr?->dtr_name ?? 'N/A',
                        'visit_result' => $log->visit_result,
                        'visit_date' => $log->visit_date?->format('Y-m-d'),
                        'remarks' => $log->remarks,
                    ];
                });
        }

        $totalPlans = VisitPlan::count();
        $completedPlans = VisitPlan::where('status', 'completed')->count();
        $pendingPromises = PromiseToPay::where('status', 'pending')->count();
        $fulfilledPromises = PromiseToPay::where('status', 'fulfilled')->count();

        return Inertia::render('admin/visit-management/index', [
            'visitPlans' => $visitPlans,
            'promises' => $promises,
            'visitLogsByPlan' => $visitLogsByPlan,
            'billCollectors' => $billCollectors,
            'villages' => $villages,
            'dtrs' => $dtrs,
            'filters' => $request->only(['billcollector_id', 'date', 'village_id', 'dtr_id', 'search']),
            'stats' => [
                'totalPlans' => $totalPlans,
                'completedPlans' => $completedPlans,
                'pendingPromises' => $pendingPromises,
                'fulfilledPromises' => $fulfilledPromises,
            ],
        ]);
    }
}
