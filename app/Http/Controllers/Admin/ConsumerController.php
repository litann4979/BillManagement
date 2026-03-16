<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use App\Models\User;
use App\Models\Role;
use App\Models\Circle;
use App\Models\Category;
use App\Imports\ConsumersImport;
use App\Models\ImportJob;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class ConsumerController extends Controller
{
    public function index(Request $request)
    {
        $query = Consumer::with([
            'billcollector:id,name',
            'sectionRelation.subdivision.division.circle',
            'village:id,name',
            'feeder:id,name',
            'dtr:id,dtr_name,dtr_code',
            'categoryRelation:id,name',
        ]);

        // Search bar
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('scno', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Hierarchy filters
        if ($request->filled('circle_id')) {
            $query->whereHas('sectionRelation.subdivision.division', function ($q) use ($request) {
                $q->where('circle_id', $request->circle_id);
            });
        }
        if ($request->filled('division_id')) {
            $query->whereHas('sectionRelation.subdivision', function ($q) use ($request) {
                $q->where('division_id', $request->division_id);
            });
        }
        if ($request->filled('subdivision_id')) {
            $query->whereHas('sectionRelation', function ($q) use ($request) {
                $q->where('subdivision_id', $request->subdivision_id);
            });
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        // Other filters
        if ($request->filled('billcollector_id')) {
            $query->where('billcollector_id', $request->billcollector_id);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $consumers = $query->orderBy('id', 'asc')
                    ->paginate(15)
                    ->withQueryString();

        $billRole = Role::where('name', 'billcollector')->first();
        $billCollectors = $billRole
            ? User::where('role_id', $billRole->id)->get(['id', 'name'])
            : collect();

        $circles = Circle::orderBy('name')->get(['id', 'name']);
        $categories = Category::orderBy('name')->get(['id', 'name']);

        $activeImport = ImportJob::whereIn('status', ['queued', 'processing'])
            ->latest()
            ->first();

        return Inertia::render('admin/consumers/index', [
            'consumers' => $consumers,
            'billCollectors' => $billCollectors,
            'circles' => $circles,
            'categories' => $categories,
            'filters' => $request->only([
                'search', 'billcollector_id', 'category_id',
                'circle_id', 'division_id', 'subdivision_id', 'section_id',
            ]),
            'activeImport' => $activeImport ? [
                'id' => $activeImport->id,
                'total_rows' => $activeImport->total_rows,
                'processed_rows' => $activeImport->processed_rows,
                'progress_percentage' => $activeImport->progressPercentage(),
                'status' => $activeImport->status,
            ] : null,
        ]);
    }

    public function create()
    {
        $billRole = Role::where('name', 'billcollector')->first();
        $billCollectors = $billRole
            ? User::where('role_id', $billRole->id)->get(['id', 'name'])
            : collect();

        return Inertia::render('admin/consumers/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'billCollectors' => $billCollectors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'scno'     => 'required|unique:consumers',
            'name'     => 'required',
            'phone'    => 'nullable|string',
            'email'    => 'nullable|email',
            'section_id' => 'nullable|exists:sections,id',
            'village_id' => 'nullable|exists:villages,id',
            'feeder_id' => 'nullable|exists:feeders,id',
            'dtr_id' => 'nullable|exists:dtrs,id',
            'subdivision_id' => 'nullable|exists:subdivisions,id',
            'category_id' => 'nullable|exists:categories,id',
            'billcollector_id' => 'nullable|exists:users,id',
        ]);

        $consumer = Consumer::create($request->only([
            'scno', 'name',
            'section_id', 'village_id', 'feeder_id', 'dtr_id',
            'subdivision_id', 'category_id', 'billcollector_id',
            'address_1', 'address_2', 'address_3',
            'email', 'phone',
            'gis_location', 'latitude', 'longitude',
            'date_of_connection',
            'bill_grp',
            'meter_no', 'cd',
            'closing_balance', 'cfy', 'ecl_arrear'
        ]));

        if ($request->filled('bill_month') && $request->filled('bill_year')) {
            $monthNumber = is_numeric($request->bill_month)
                ? (int) $request->bill_month
                : Carbon::parse("1 {$request->bill_month} {$request->bill_year}")->month;

            $billPeriod = Carbon::createFromDate($request->bill_year, $monthNumber, 1)->format('Y-m-d');

            $billedAmount = (float) ($request->billed_amount ?? 0);
            $paidAmount = (float) ($request->paid_amount ?? 0);

            $bill = $consumer->monthlyBills()->create([
                'bill_month' => $request->bill_month,
                'bill_year' => $request->bill_year,
                'bill_period' => $billPeriod,
                'opening_balance' => $request->opening_balance,
                'bill_status' => BillingService::calculateBillStatus($billedAmount, $paidAmount),
                'meter_status' => $request->meter_status,
                'billed_units' => $request->billed_units,
                'billed_amount' => $billedAmount,
                'paid_amount' => $paidAmount,
            ]);

            BillingService::syncAfterBillChange($bill);
        }

        return redirect()->route('consumers.index');
    }

    public function show($id)
    {
        $consumer = Consumer::with([
            'monthlyBills',
            'billcollector:id,name',
            'sectionRelation.subdivision.division.circle',
            'village:id,name',
            'feeder:id,name',
            'dtr:id,dtr_name,dtr_code',
            'categoryRelation:id,name',
        ])->findOrFail($id);

        return Inertia::render('admin/consumers/show', [
            'consumer' => $consumer
        ]);
    }

    public function edit($id)
    {
        $consumer = Consumer::with([
            'sectionRelation.subdivision.division.circle',
            'monthlyBills',
        ])->findOrFail($id);

        $billRole = Role::where('name', 'billcollector')->first();
        $billCollectors = $billRole
            ? User::where('role_id', $billRole->id)->get(['id', 'name'])
            : collect();

        return Inertia::render('admin/consumers/edit', [
            'consumer' => $consumer,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'billCollectors' => $billCollectors,
        ]);
    }

    public function update(Request $request, $id)
    {
        $consumer = Consumer::findOrFail($id);

        $request->validate([
            'scno' => "required|unique:consumers,scno,$id",
            'name' => 'required',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'section_id' => 'nullable|exists:sections,id',
            'village_id' => 'nullable|exists:villages,id',
            'feeder_id' => 'nullable|exists:feeders,id',
            'dtr_id' => 'nullable|exists:dtrs,id',
            'subdivision_id' => 'nullable|exists:subdivisions,id',
            'category_id' => 'nullable|exists:categories,id',
            'billcollector_id' => 'nullable|exists:users,id',
        ]);

        $consumer->update($request->only([
            'scno', 'name',
            'section_id', 'village_id', 'feeder_id', 'dtr_id',
            'subdivision_id', 'category_id', 'billcollector_id',
            'address_1', 'address_2', 'address_3',
            'email', 'phone',
            'gis_location', 'latitude', 'longitude',
            'date_of_connection',
            'bill_grp',
            'meter_no', 'cd',
            'closing_balance', 'cfy', 'ecl_arrear'
        ]));

        if ($request->filled('bill_month') && $request->filled('bill_year')) {
            $monthNumber = is_numeric($request->bill_month)
                ? (int) $request->bill_month
                : Carbon::parse("1 {$request->bill_month} {$request->bill_year}")->month;

            $billPeriod = Carbon::createFromDate($request->bill_year, $monthNumber, 1)->format('Y-m-d');

            $exists = $consumer->monthlyBills()->where('bill_period', $billPeriod)->exists();

            if ($exists) {
                return back()->withErrors([
                    'bill_month' => "A bill for {$billPeriod} already exists for this consumer."
                ]);
            }

            $billedAmount = (float) ($request->billed_amount ?? 0);
            $paidAmount = (float) ($request->paid_amount ?? 0);

            $bill = $consumer->monthlyBills()->create([
                'bill_month' => $request->bill_month,
                'bill_year' => $request->bill_year,
                'bill_period' => $billPeriod,
                'opening_balance' => $request->opening_balance,
                'bill_status' => BillingService::calculateBillStatus($billedAmount, $paidAmount),
                'meter_status' => $request->meter_status,
                'billed_units' => $request->billed_units,
                'billed_amount' => $billedAmount,
                'paid_amount' => $paidAmount,
            ]);

            BillingService::syncAfterBillChange($bill);
        }

        return redirect()->route('consumers.index');
    }

    public function destroy($id)
    {
        Consumer::findOrFail($id)->delete();

        return redirect()->route('consumers.index');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'billcollector_id' => 'required|exists:users,id',
        ]);

        set_time_limit(0);

        try {
            $uploadedFile = $request->file('file');
            $storedPath = $uploadedFile->store('imports');

            $import = ConsumersImport::prepare(
                Storage::path($storedPath),
                (int) $request->billcollector_id,
            );

            $importJob = ImportJob::create([
                'file_name' => $uploadedFile->getClientOriginalName(),
                'total_rows' => $import->totalRows,
                'status' => 'queued',
                'created_by' => $request->user()?->id,
            ]);

            $import->importJobId = $importJob->id;

            Excel::queueImport($import, $storedPath, 'local');

            return redirect()->route('consumers.index');
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function importProgress(int $id): JsonResponse
    {
        $job = ImportJob::findOrFail($id);

        return response()->json([
            'id' => $job->id,
            'file_name' => $job->file_name,
            'total_rows' => $job->total_rows,
            'processed_rows' => $job->processed_rows,
            'progress_percentage' => $job->progressPercentage(),
            'status' => $job->status,
            'error_message' => $job->error_message,
            'started_at' => $job->started_at?->toIso8601String(),
            'completed_at' => $job->completed_at?->toIso8601String(),
        ]);
    }
}
