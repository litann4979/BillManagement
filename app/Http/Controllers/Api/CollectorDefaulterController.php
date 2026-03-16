<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsumerArrear;
use Illuminate\Http\Request;

class CollectorDefaulterController extends Controller
{
    public function index(Request $request)
    {
        $arrears = $this->baseQuery($request)
            ->where('months_due', '>', 0)
            ->orderByDesc('total_arrear')
            ->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $arrears,
        ]);
    }

    public function threeMonth(Request $request)
    {
        $arrears = $this->baseQuery($request)
            ->where('months_due', '>=', 3)
            ->orderByDesc('total_arrear')
            ->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $arrears,
        ]);
    }

    public function byVillage(Request $request, $villageId)
    {
        $arrears = $this->baseQuery($request)
            ->where('months_due', '>', 0)
            ->whereHas('consumer', fn ($q) => $q->where('village_id', $villageId))
            ->orderByDesc('total_arrear')
            ->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $arrears,
        ]);
    }

    public function byDtr(Request $request, $dtrId)
    {
        $arrears = $this->baseQuery($request)
            ->where('months_due', '>', 0)
            ->whereHas('consumer', fn ($q) => $q->where('dtr_id', $dtrId))
            ->orderByDesc('total_arrear')
            ->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $arrears,
        ]);
    }

    private function baseQuery(Request $request)
    {
        return ConsumerArrear::with([
                'consumer:id,scno,name,phone,village_id,dtr_id',
                'consumer.village:id,name',
                'consumer.dtr:id,dtr_name',
            ])
            ->whereHas('consumer', fn ($q) => $q->where('billcollector_id', $request->user()->id));
    }
}
