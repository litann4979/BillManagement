<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use App\Models\Payment;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consumer_id' => 'required|exists:consumers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required|string|in:cash,upi,cheque,online',
        ]);

        $consumer = Consumer::where('billcollector_id', $request->user()->id)
            ->find($request->consumer_id);

        if (!$consumer) {
            return response()->json([
                'status' => false,
                'message' => 'Consumer not found or not assigned to you.',
            ], 404);
        }

        $remainingAmount = (float) $request->amount;

        $updatedBills = DB::transaction(function () use ($consumer, $request, &$remainingAmount) {
            $bills = ConsumerMonthlyBill::where('consumer_id', $consumer->id)
                ->whereRaw('COALESCE(billed_amount, 0) > COALESCE(paid_amount, 0)')
                ->orderBy('bill_period')
                ->lockForUpdate()
                ->get();

            $affected = [];

            foreach ($bills as $bill) {
                if ($remainingAmount <= 0) {
                    break;
                }

                $billedAmount = (float) ($bill->billed_amount ?? 0);
                $currentPaid = (float) ($bill->paid_amount ?? 0);
                $outstanding = $billedAmount - $currentPaid;

                if ($outstanding <= 0) {
                    continue;
                }

                $applyAmount = min($remainingAmount, $outstanding);
                $newPaid = $currentPaid + $applyAmount;

                $bill->update([
                    'paid_amount' => $newPaid,
                    'bill_status' => BillingService::calculateBillStatus($billedAmount, $newPaid),
                ]);

                Payment::create([
                    'consumer_id' => $consumer->id,
                    'bill_id' => $bill->id,
                    'payment_amount' => $applyAmount,
                    'payment_mode' => $request->payment_mode,
                    'payment_date' => now()->toDateString(),
                    'collected_by' => $request->user()->id,
                ]);

                $bill->refresh();
                BillingService::syncDefaulter($bill);

                $affected[] = [
                    'bill_id' => $bill->id,
                    'bill_period' => optional($bill->bill_period)->format('Y-m-d'),
                    'applied' => $applyAmount,
                    'new_paid' => $newPaid,
                    'new_status' => $bill->bill_status,
                ];

                $remainingAmount -= $applyAmount;
            }

            BillingService::refreshConsumerArrears($consumer->id);

            return $affected;
        });

        return response()->json([
            'status' => true,
            'message' => 'Payment recorded.',
            'data' => [
                'total_received' => (float) $request->amount,
                'total_applied' => (float) $request->amount - $remainingAmount,
                'unapplied' => $remainingAmount,
                'bills_updated' => $updatedBills,
            ],
        ], 201);
    }
}
