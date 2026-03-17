<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectorConsumerController extends Controller
{
public function index(Request $request)
{
    $user = $request->user();

    $query = Consumer::where('billcollector_id', $user->id)
        ->with([
            'sectionRelation:id,name',
            'categoryRelation:id,name'
        ]);

    // 🔍 SEARCH
    if ($search = $request->search) {
        $query->where(function ($q) use ($search) {
            $q->where('scno', 'like', "%{$search}%")
              ->orWhere('meter_no', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        });
    }

    // 📅 MONTH FORMAT
    $monthName = $request->month
        ? date('M', mktime(0, 0, 0, (int)$request->month, 10))
        : null;

    // 🔎 FILTER BY BILL CONDITIONS
    if ($request->status || $request->month || $request->year) {
        $query->whereHas('monthlyBills', function ($q) use ($request, $monthName) {

            if ($request->status) {
                $q->where('bill_status', $request->status);
            }

            if ($monthName) {
                $q->where('bill_month', $monthName);
            }

            if ($request->year) {
                $q->where('bill_year', $request->year);
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 🔥 OPTIMIZED SUMMARY (NO PLUCK, NO MEMORY LOAD)
    |--------------------------------------------------------------------------
    */

    $summary = ConsumerMonthlyBill::whereIn('consumer_id', function ($q) use ($user, $request) {

            $q->select('id')
              ->from('consumers')
              ->where('billcollector_id', $user->id);

            // apply search filter
            if ($request->search) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('scno', 'like', "%{$request->search}%")
                        ->orWhere('meter_no', 'like', "%{$request->search}%")
                        ->orWhere('name', 'like', "%{$request->search}%");
                });
            }

        })
        ->when($monthName, fn($q) => $q->where('bill_month', $monthName))
        ->when($request->year, fn($q) => $q->where('bill_year', $request->year))
        ->selectRaw("
            COUNT(DISTINCT CASE WHEN bill_status = 'paid' THEN consumer_id END) as total_paid,
            COUNT(DISTINCT CASE WHEN bill_status = 'unpaid' THEN consumer_id END) as total_unpaid,
            COUNT(DISTINCT CASE WHEN bill_status = 'partial' THEN consumer_id END) as total_partial,
            COUNT(DISTINCT CASE WHEN bill_status = 'overdue' THEN consumer_id END) as total_overdue,
            COALESCE(SUM(paid_amount),0) as total_paid_amount
        ")
        ->first();

    /*
    |--------------------------------------------------------------------------
    | 📊 PAGINATION
    |--------------------------------------------------------------------------
    */

    $consumers = $query->paginate(20);

    $data = $consumers->getCollection()->map(function ($consumer) {
        return [
            'id' => $consumer->id,
            'name' => $consumer->name,
            'scno' => $consumer->scno,
            'address_1' => $consumer->address_1,
            'address_2' => $consumer->address_2,
            'address_3' => $consumer->address_3,
            'consumer_mail_id' => $consumer->email,
            'phone_no' => $consumer->phone,
            'section' => $consumer->sectionRelation->name ?? null,
            'meter_no' => $consumer->meter_no,
            'consumer_category' => $consumer->categoryRelation->name ?? null,
            'cd' => $consumer->cd,
            'date_of_connection' => optional($consumer->date_of_connection)->format('Y-m-d'),
            'gis_location' => $consumer->gis_location
        ];
    });

    /*
    |--------------------------------------------------------------------------
    | ✅ FINAL RESPONSE (UNCHANGED)
    |--------------------------------------------------------------------------
    */

    return response()->json([
        'status' => true,
        'total_consumers' => $query->count(), // ✅ FIXED
        'total_paid' => (int) $summary->total_paid,
        'total_unpaid' => (int) $summary->total_unpaid,
        'total_partial' => (int) $summary->total_partial,
        'total_overdue' => (int) $summary->total_overdue,
        'total_paid_amount' => (float) $summary->total_paid_amount,
        'current_page' => $consumers->currentPage(),
        'per_page' => $consumers->perPage(),
        'data' => $data
    ]);
}

public function show(Request $request, $id)
{
    $monthFilter = $request->month;
    $yearFilter  = $request->year;
    $status      = $request->status;

    $monthName = $monthFilter
        ? date('M', mktime(0, 0, 0, (int) $monthFilter, 10))
        : null;

    $consumer = Consumer::where('billcollector_id', $request->user()->id)
        ->with([
            'subdivision:id,name',
            'sectionRelation:id,name',
            'village:id,name',
            'feeder:id,name',
            'dtr:id,dtr_name',
            'categoryRelation:id,name',

            'arrear:id,consumer_id,total_arrear,months_due,last_bill_period',

            // FILTERED bills (for UI display)
            'monthlyBills' => function ($q) use ($monthName, $yearFilter, $status) {

                if ($status) {
                    $q->where('bill_status', $status);
                }

                if ($monthName) {
                    $q->where('bill_month', $monthName);
                }

                if ($yearFilter) {
                    $q->where('bill_year', $yearFilter);
                }

                $q->orderByDesc('bill_period');

                if (!$monthName && !$yearFilter && !$status) {
                    $q->limit(12);
                }
            },

            'defaulters' => fn ($q) => $q->where('status', 'active')->orderByDesc('bill_period'),
            'visits' => fn ($q) => $q->orderByDesc('visit_date')->limit(5),
            'promises' => fn ($q) => $q->orderByDesc('created_at')->limit(5),
        ])
        ->find($id);

    if (!$consumer) {
        return response()->json([
            'status' => false,
            'message' => 'Consumer not found.',
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔥 PRODUCTION SAFE AGGREGATIONS (NO COLLECTION LOAD)
    |--------------------------------------------------------------------------
    */

    // BILLING SUMMARY
    $billingSummary = ConsumerMonthlyBill::where('consumer_id', $consumer->id)
        ->selectRaw('
            MIN(bill_period) as first_bill_period,
            COUNT(*) as total_billing_months,
            SUM(billed_amount) as total_billed_amount
        ')
        ->first();

    // COLLECTION SUMMARY (paid_amount > 0)
    $collectionSummary = ConsumerMonthlyBill::where('consumer_id', $consumer->id)
        ->where('paid_amount', '>', 0)
        ->selectRaw('
            MIN(bill_period) as first_collection_period,
            COUNT(*) as total_collection_months,
            SUM(paid_amount) as total_collected_amount
        ')
        ->first();

    /*
    |--------------------------------------------------------------------------
    | FORMAT DATES (Month Year)
    |--------------------------------------------------------------------------
    */

    $billSince = $billingSummary->first_bill_period
        ? \Carbon\Carbon::parse($billingSummary->first_bill_period)->format('M Y')
        : null;

    $collectionSince = $collectionSummary->first_collection_period
        ? \Carbon\Carbon::parse($collectionSummary->first_collection_period)->format('M Y')
        : null;

    /*
    |--------------------------------------------------------------------------
    | BALANCE CALCULATIONS
    |--------------------------------------------------------------------------
    */

    $totalBillingMonths   = (int) ($billingSummary->total_billing_months ?? 0);
    $totalBilledAmount   = (float) ($billingSummary->total_billed_amount ?? 0);

    $totalCollectionMonths = (int) ($collectionSummary->total_collection_months ?? 0);
    $totalCollectedAmount  = (float) ($collectionSummary->total_collected_amount ?? 0);

    $balanceRecords = $totalBillingMonths - $totalCollectionMonths;
    $balanceAmount  = $totalBilledAmount - $totalCollectedAmount;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([
        'status' => true,
        'data' => [
            'consumer_id' => $consumer->id,
            'name' => $consumer->name,
            'scno' => $consumer->scno,

            'subdivision' => $consumer->subdivision->name ?? null,
            'section' => $consumer->sectionRelation->name ?? null,
            'village' => $consumer->village->name ?? null,
            'feeder' => $consumer->feeder->name ?? null,
            'dtr' => $consumer->dtr->dtr_name ?? null,
            'category' => $consumer->categoryRelation->name ?? null,

            'phone' => $consumer->phone,
            'email' => $consumer->email,
            'meter_no' => $consumer->meter_no,

            'date_of_connection' => $consumer->date_of_connection?->format('Y-m-d'),

            'closing_balance' => $consumer->closing_balance,
            'cfy' => $consumer->cfy,
            'ecl_arrear' => $consumer->ecl_arrear,

            'arrear_amount' => $consumer->arrear->total_arrear ?? 0,
            'months_due' => $consumer->arrear->months_due ?? 0,

            /*
            |--------------------------------------------------------------------------
            | 🔥 NEW ANALYTICS
            |--------------------------------------------------------------------------
            */

            'bill_since' => $billSince,
            'total_billing_months' => $totalBillingMonths,
            'total_billed_amount' => $totalBilledAmount,

            'collection_since' => $collectionSince,
            'total_collection_months' => $totalCollectionMonths,
            'total_collected_amount' => $totalCollectedAmount,

            'balance_records' => $balanceRecords,
            'balance_amount' => $balanceAmount,

            /*
            |--------------------------------------------------------------------------
            | EXISTING DATA
            |--------------------------------------------------------------------------
            */

            'monthly_bills' => $consumer->monthlyBills,
            'active_defaults' => $consumer->defaulters,
            'recent_visits' => $consumer->visits,
            'recent_promises' => $consumer->promises,
        ],
    ]);
}

    public function downloadPdf(Request $request, $consumerId)
    {
        $consumer = Consumer::where('billcollector_id', $request->user()->id)
            ->with([
                'village:id,name',
                'feeder:id,name',
                'dtr:id,dtr_name,dtr_code',
                'categoryRelation:id,name',
                'arrear:id,consumer_id,total_arrear,months_due,last_bill_period',
                'monthlyBills' => fn ($q) => $q->orderByDesc('bill_period')->limit(12),
                'defaulters' => fn ($q) => $q->where('status', 'active')->orderByDesc('bill_period'),
                'visits' => fn ($q) => $q->orderByDesc('visit_date')->limit(5),
                'promises' => fn ($q) => $q->orderByDesc('created_at')->limit(5),
            ])
            ->find($consumerId);

        if (!$consumer) {
            return response()->json([
                'status' => false,
                'message' => 'Consumer not found.',
            ], 404);
        }

        $data = [
            'consumer' => $consumer,
            'address' => trim(implode(', ', array_filter([
                $consumer->address_1,
                $consumer->address_2,
                $consumer->address_3,
            ]))),
            'village' => $consumer->village->name ?? 'N/A',
            'feeder' => $consumer->feeder->name ?? 'N/A',
            'dtr' => $consumer->dtr->dtr_name ?? 'N/A',
            'category' => $consumer->categoryRelation->name ?? 'N/A',
            'arrear_amount' => $consumer->arrear->total_arrear ?? 0,
            'months_due' => $consumer->arrear->months_due ?? 0,
            'last_bill_period' => $consumer->arrear->last_bill_period?->format('Y-m-d') ?? 'N/A',
            'monthly_bills' => $consumer->monthlyBills,
            'active_defaults' => $consumer->defaulters,
            'recent_visits' => $consumer->visits,
            'recent_promises' => $consumer->promises,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.consumer-details', $data);

        return $pdf->download("consumer-{$consumer->scno}.pdf");
    }
}
