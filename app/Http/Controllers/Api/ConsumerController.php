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

    $query = Consumer::where('billcollector_id', $user->id);

    // SEARCH
    if ($search = $request->search) {
        $query->where(function ($q) use ($search) {
            $q->where('scno', 'like', "%{$search}%")
              ->orWhere('meter_no', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        });
    }

    // CATEGORY FILTER
    if ($category = $request->category) {
        $query->where('category', $category);
    }

    // MONTH + YEAR FILTER
    if ($request->month || $request->year) {

        $monthName = null;

        if ($request->month) {
            $monthName = date('M', mktime(0, 0, 0, $request->month, 10));
        }

        $query->whereHas('monthlyBills', function ($q) use ($monthName, $request) {

            if ($monthName) {
                $q->where('bill_month', $monthName);
            }

            if ($request->year) {
                $q->where('bill_year', $request->year);
            }

        });
    }

    // TOTAL FILTERED COUNT
    $totalConsumers = $query->count();

    // PAGINATION
    $consumers = $query->paginate(20);

    return response()->json([
        'status' => true,
        'total_consumers' => $totalConsumers,
        'current_page' => $consumers->currentPage(),
        'per_page' => $consumers->perPage(),
        'data' => $consumers->items()
    ]);
}
    /**
     * 2️⃣ Show Single Consumer
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $consumer = Consumer::with('monthlyBills')
            ->where('billcollector_id', $user->id)
            ->find($id);

        if (!$consumer) {
            return response()->json([
                'status' => false,
                'message' => 'Consumer not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $consumer
        ]);
    }
}