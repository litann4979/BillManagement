<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\PromiseToPay;
use Illuminate\Http\Request;

class PromiseToPayController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'promised_date' => 'required|date|after_or_equal:today',
            'promised_amount' => 'nullable|numeric|min:0.01',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $consumer = Consumer::where('billcollector_id', $request->user()->id)
            ->find($request->consumer_id);

        if (!$consumer) {
            return response()->json([
                'status' => false,
                'message' => 'Consumer not found or not assigned to you.',
            ], 404);
        }

        $promise = PromiseToPay::create([
            'consumer_id' => $consumer->id,
            'promised_amount' => $request->promised_amount,
            'promise_date' => $request->promised_date,
            'remarks' => $request->remarks,
            'status' => 'pending',
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Promise to pay recorded.',
            'data' => $promise,
        ], 201);
    }
}
