<?php

namespace App\Services;

use App\Models\ConsumerArrear;
use App\Models\ConsumerMonthlyBill;
use App\Models\Defaulter;
use Illuminate\Support\Facades\DB;

class BillingService
{
    /**
     * Determine bill_status from billed_amount and paid_amount.
     */
    public static function calculateBillStatus(float $billedAmount, float $paidAmount): string
    {
        if ($paidAmount <= 0) {
            return 'unpaid';
        }

        if ($paidAmount < $billedAmount) {
            return 'partial';
        }

        if ($paidAmount == $billedAmount) {
            return 'paid';
        }

        return 'overdue';
    }

    /**
     * After a bill is created or updated, sync the defaulter record
     * and refresh the consumer arrears summary.
     */
    public static function syncAfterBillChange(ConsumerMonthlyBill $bill): void
    {
        static::syncDefaulter($bill);
        static::refreshConsumerArrears($bill->consumer_id);
    }

    /**
     * Sync defaulter record for a single bill.
     */
    public static function syncDefaulter(ConsumerMonthlyBill $bill): void
    {
        $billedAmount = (float) ($bill->billed_amount ?? 0);
        $paidAmount = (float) ($bill->paid_amount ?? 0);
        $amountDue = $billedAmount - $paidAmount;

        if ($amountDue > 0) {
            Defaulter::updateOrCreate(
                [
                    'consumer_id' => $bill->consumer_id,
                    'bill_period' => $bill->bill_period,
                ],
                [
                    'amount_due' => $amountDue,
                    'status' => 'active',
                ]
            );
        } else {
            Defaulter::where('consumer_id', $bill->consumer_id)
                ->where('bill_period', $bill->bill_period)
                ->delete();
        }
    }

    /**
     * Recalculate months_due + total_arrear from the defaulters table
     * and persist into consumer_arrears.
     */
    public static function refreshConsumerArrears(int $consumerId): void
    {
        $monthsDue = Defaulter::where('consumer_id', $consumerId)->count();
        $totalArrear = Defaulter::where('consumer_id', $consumerId)->sum('amount_due');
        $lastBillPeriod = Defaulter::where('consumer_id', $consumerId)->max('bill_period');

        if ($monthsDue > 0) {
            ConsumerArrear::updateOrCreate(
                ['consumer_id' => $consumerId],
                [
                    'months_due' => $monthsDue,
                    'total_arrear' => $totalArrear,
                    'last_bill_period' => $lastBillPeriod,
                ]
            );
        } else {
            ConsumerArrear::where('consumer_id', $consumerId)->delete();
        }
    }

    /**
     * Bulk-sync defaulters and arrears for many consumers at once (for imports).
     * Uses batch SQL operations instead of per-row queries.
     */
    public static function bulkSyncAfterImport(array $consumerIds): void
    {
        $uniqueIds = array_unique($consumerIds);

        foreach (array_chunk($uniqueIds, 500) as $chunk) {
            $bills = ConsumerMonthlyBill::whereIn('consumer_id', $chunk)
                ->select('consumer_id', 'bill_period', 'billed_amount', 'paid_amount')
                ->get();

            $defaulterUpserts = [];
            $clearPairs = [];
            $now = now();

            foreach ($bills as $bill) {
                $amountDue = (float) $bill->billed_amount - (float) $bill->paid_amount;

                if ($amountDue > 0) {
                    $defaulterUpserts[] = [
                        'consumer_id' => $bill->consumer_id,
                        'bill_period' => $bill->bill_period,
                        'amount_due' => $amountDue,
                        'status' => 'active',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                } else {
                    $clearPairs[] = [
                        'consumer_id' => $bill->consumer_id,
                        'bill_period' => $bill->bill_period,
                    ];
                }
            }

            if ($defaulterUpserts) {
                foreach (array_chunk($defaulterUpserts, 1000) as $batch) {
                    Defaulter::upsert(
                        $batch,
                        ['consumer_id', 'bill_period'],
                        ['amount_due', 'status', 'updated_at']
                    );
                }
            }

            foreach ($clearPairs as $pair) {
                Defaulter::where('consumer_id', $pair['consumer_id'])
                    ->where('bill_period', $pair['bill_period'])
                    ->delete();
            }

            $arrearStats = Defaulter::whereIn('consumer_id', $chunk)
                ->select(
                    'consumer_id',
                    DB::raw('COUNT(*) as months_due'),
                    DB::raw('SUM(amount_due) as total_arrear'),
                    DB::raw('MAX(bill_period) as last_bill_period')
                )
                ->groupBy('consumer_id')
                ->get()
                ->keyBy('consumer_id');

            $arrearUpserts = [];
            $clearArrearIds = [];

            foreach ($chunk as $consumerId) {
                if ($arrearStats->has($consumerId)) {
                    $stat = $arrearStats[$consumerId];
                    $arrearUpserts[] = [
                        'consumer_id' => $consumerId,
                        'months_due' => $stat->months_due,
                        'total_arrear' => $stat->total_arrear,
                        'last_bill_period' => $stat->last_bill_period,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                } else {
                    $clearArrearIds[] = $consumerId;
                }
            }

            if ($arrearUpserts) {
                ConsumerArrear::upsert(
                    $arrearUpserts,
                    ['consumer_id'],
                    ['months_due', 'total_arrear', 'last_bill_period', 'updated_at']
                );
            }

            if ($clearArrearIds) {
                ConsumerArrear::whereIn('consumer_id', $clearArrearIds)->delete();
            }
        }
    }
}
