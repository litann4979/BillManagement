<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use Illuminate\Http\Request;

class ConsumerController extends Controller
{

    /**
     * 1️⃣ Get All Consumers (only for logged-in bill collector)
     */
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

    $consumers = $query->paginate(20);

    $data = $consumers->getCollection()->map(function ($consumer) {

        return [
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

            'date_of_connection' => $consumer->date_of_connection
                ? $consumer->date_of_connection->format('Y-m-d')
                : null,

            'gis_location' => $consumer->gis_location
        ];
    });

    return response()->json([
        'status' => true,
        'current_page' => $consumers->currentPage(),
        'per_page' => $consumers->perPage(),
        'data' => $data
    ]);
}
    /**
     * 2️⃣ Show Single Consumer with full details
     *
     * Filters: ?month=3&year=2026 applies to monthlyBills and visitLogs
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $monthFilter = $request->month;
        $yearFilter  = $request->year;
        $monthName   = $monthFilter ? date('M', mktime(0, 0, 0, (int) $monthFilter, 10)) : null;

        $billConstraint = function ($q) use ($monthName, $yearFilter) {
            if ($monthName) {
                $q->where('bill_month', $monthName);
            }
            if ($yearFilter) {
                $q->where('bill_year', $yearFilter);
            }
            $q->orderByDesc('bill_year')->orderByDesc('bill_period');
        };

        $visitConstraint = function ($q) use ($monthFilter, $yearFilter) {
            if ($monthFilter) {
                $q->whereMonth('visit_date', (int) $monthFilter);
            }
            if ($yearFilter) {
                $q->whereYear('visit_date', (int) $yearFilter);
            }
            $q->with('creator:id,name')
              ->orderByDesc('visit_date');
        };

        $consumer = Consumer::with([
                'subdivision:id,name',
                'sectionRelation:id,name',
                'village:id,name',
                'feeder:id,name',
                'dtr:id,name',
                'categoryRelation:id,name',
                'arrear',
                'defaulters' => fn ($q) => $q->where('status', 'active')->orderByDesc('bill_period'),
                'promises'   => fn ($q) => $q->orderByDesc('promise_date')->limit(10),
                'monthlyBills' => $billConstraint,
                'visits'       => $visitConstraint,
            ])
            ->where('billcollector_id', $user->id)
            ->find($id);

        if (!$consumer) {
            return response()->json([
                'status'  => false,
                'message' => 'Consumer not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => [
                'id'                 => $consumer->id,
                'scno'               => $consumer->scno,
                'name'               => $consumer->name,
                'phone'              => $consumer->phone,
                'email'              => $consumer->email,
                'address'            => trim(implode(', ', array_filter([
                    $consumer->address_1,
                    $consumer->address_2,
                    $consumer->address_3,
                ]))),
                'meter_no'           => $consumer->meter_no,
                'category'           => $consumer->categoryRelation?->name,
                'date_of_connection' => $consumer->date_of_connection?->format('Y-m-d'),
                'gis_location'       => $consumer->gis_location,
                'latitude'           => $consumer->latitude,
                'longitude'          => $consumer->longitude,

                'hierarchy' => [
                    'subdivision' => $consumer->subdivision?->name,
                    'section'     => $consumer->sectionRelation?->name,
                    'village'     => $consumer->village?->name,
                    'feeder'      => $consumer->feeder?->name,
                    'dtr'         => $consumer->dtr?->name,
                ],

                'arrears' => $consumer->arrear ? [
                    'months_due'       => $consumer->arrear->months_due,
                    'total_arrear'     => (float) $consumer->arrear->total_arrear,
                    'last_bill_period' => $consumer->arrear->last_bill_period,
                ] : [
                    'months_due'       => 0,
                    'total_arrear'     => 0,
                    'last_bill_period' => null,
                ],

                'monthly_bills' => $consumer->monthlyBills->map(fn ($b) => [
                    'id'            => $b->id,
                    'bill_month'    => $b->bill_month,
                    'bill_year'     => $b->bill_year,
                    'bill_period'   => $b->bill_period?->format('Y-m-d'),
                    'billed_amount' => (float) $b->billed_amount,
                    'paid_amount'   => (float) $b->paid_amount,
                    'bill_status'   => $b->bill_status,
                ]),

                'active_defaults' => $consumer->defaulters->map(fn ($d) => [
                    'id'          => $d->id,
                    'bill_period' => $d->bill_period,
                    'amount_due'  => (float) $d->amount_due,
                    'status'      => $d->status,
                ]),

                'visit_logs' => $consumer->visits->map(fn ($v) => [
                    'id'           => $v->id,
                    'visit_date'   => $v->visit_date?->format('Y-m-d'),
                    'visit_result' => $v->visit_result,
                    'remarks'      => $v->remarks,
                    'visited_by'   => $v->creator?->name,
                ]),

                'recent_promises' => $consumer->promises->map(fn ($p) => [
                    'id'             => $p->id,
                    'promise_date'   => $p->promise_date?->format('Y-m-d'),
                    'promised_amount'=> (float) $p->promised_amount,
                    'remarks'        => $p->remarks,
                ]),
            ],
        ]);
    }
}