<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsumerArrear;
use App\Models\ConsumerFlag;
use App\Models\Defaulter;
use App\Models\Dtr;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DefaulterManagementController extends Controller
{
    public function index(Request $request)
    {
        $villages = Village::select('id', 'name')->orderBy('name')->get();
        $dtrs = Dtr::select('id', 'dtr_name', 'dtr_code')->orderBy('dtr_name')->get();

        $query = ConsumerArrear::where('months_due', '>', 0)
            ->with([
                'consumer:id,scno,name,phone,village_id,dtr_id',
                'consumer.village:id,name',
                'consumer.dtr:id,dtr_name',
                'consumer.flags' => fn ($q) => $q->latest()->limit(1),
            ]);

        if ($request->filled('village_id')) {
            $query->whereHas('consumer', fn ($q) => $q->where('village_id', $request->village_id));
        }

        if ($request->filled('dtr_id')) {
            $query->whereHas('consumer', fn ($q) => $q->where('dtr_id', $request->dtr_id));
        }

        if ($request->filled('months_due')) {
            $months = $request->months_due;
            if ($months === '4+') {
                $query->where('months_due', '>=', 4);
            } else {
                $query->where('months_due', (int) $months);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('consumer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('scno', 'like', "%{$search}%");
            });
        }

        $defaulters = $query->orderByDesc('months_due')
            ->orderByDesc('total_arrear')
            ->paginate(20)
            ->withQueryString();

        $totalDefaulters = ConsumerArrear::where('months_due', '>', 0)->count();
        $totalArrearAmount = ConsumerArrear::where('months_due', '>', 0)->sum('total_arrear');
        $threeMonthDefaulters = ConsumerArrear::where('months_due', '>=', 3)->count();
        $flaggedConsumers = ConsumerFlag::distinct('consumer_id')->count('consumer_id');

        return Inertia::render('admin/defaulters/index', [
            'defaulters' => $defaulters,
            'villages' => $villages,
            'dtrs' => $dtrs,
            'filters' => $request->only(['village_id', 'dtr_id', 'months_due', 'search']),
            'stats' => [
                'totalDefaulters' => $totalDefaulters,
                'totalArrearAmount' => (float) $totalArrearAmount,
                'threeMonthDefaulters' => $threeMonthDefaulters,
                'flaggedConsumers' => $flaggedConsumers,
            ],
        ]);
    }

    public function flag(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'flag_type' => 'required|string|in:chronic_defaulter,meter_tampering,legal_case,suspicious_activity',
            'remarks' => 'nullable|string|max:1000',
        ]);

        ConsumerFlag::create([
            'consumer_id' => $request->consumer_id,
            'flag_type' => $request->flag_type,
            'remarks' => $request->remarks,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Consumer flagged successfully.');
    }
}
