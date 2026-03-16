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

    if ($search = $request->search) {
        $query->where(function ($q) use ($search) {
            $q->where('scno', 'like', "%{$search}%")
              ->orWhere('meter_no', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        });
    }

    $monthName = $request->month
        ? date('M', mktime(0, 0, 0, (int)$request->month, 10))
        : null;

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

    // get consumer ids
    $consumerIds = (clone $query)->pluck('id');

    // bill summary
    $billQuery = ConsumerMonthlyBill::whereIn('consumer_id', $consumerIds);

    if ($monthName) {
        $billQuery->where('bill_month', $monthName);
    }

    if ($request->year) {
        $billQuery->where('bill_year', $request->year);
    }

    $summary = (clone $billQuery)->select(
        DB::raw("COUNT(CASE WHEN bill_status = 'paid' THEN 1 END) as total_paid"),
        DB::raw("COUNT(CASE WHEN bill_status = 'unpaid' THEN 1 END) as total_unpaid"),
        DB::raw("COUNT(CASE WHEN bill_status = 'partial' THEN 1 END) as total_partial"),
        DB::raw("COUNT(CASE WHEN bill_status = 'overdue' THEN 1 END) as total_overdue"),
        DB::raw("COALESCE(SUM(paid_amount),0) as total_paid_amount")
    )->first();

    $consumers = $query->paginate(20);

    $data = $consumers->getCollection()->map(function ($consumer) {

        return [
            'id' => $consumer->id,
            'name' => $consumer->name,
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

    return response()->json([
        'status' => true,
        'total_consumers' => $consumerIds->count(),
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
