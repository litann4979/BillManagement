<?php

namespace App\Imports;

use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class ConsumersImport implements ToCollection
{
    protected $billcollectorId;

    public function __construct($billcollectorId = null)
    {
        $this->billcollectorId = $billcollectorId;
    }

    public function collection(Collection $rows)
    {
        $monthRow = $rows[0];   // row containing Apr-24, May-24...
        $columnRow = $rows[1];  // row containing Opening Balance etc

        // Find dynamic column positions for trailing fields
        $closingBalanceIdx = null;
        $cfyIdx = null;
        $eclArrearIdx = null;

        foreach ($columnRow as $idx => $header) {
            $h = strtolower(trim($header ?? ''));
            if (str_contains($h, 'closing') && str_contains($h, 'balance')) $closingBalanceIdx = $idx;
            if ($h === 'cfy') $cfyIdx = $idx;
            if (str_contains($h, 'ecl') && str_contains($h, 'arrear')) $eclArrearIdx = $idx;
        }

        foreach ($rows->skip(2) as $row) {

            if (!$row[2]) {
                continue;
            }

            // Save consumer master data
            $consumer = Consumer::updateOrCreate(
                ['scno' => $row[2]],
                [
                    'billcollector_id' => $this->billcollectorId,
                    'subdivision' => $row[0],
                    'section' => $row[1],
                    'name' => $row[3],
                    'address_1' => $row[4] ?? null,
                    'address_2' => $row[5] ?? null,
                    'address_3' => $row[6] ?? null,
                    'email' => $row[7] ?? null,
                    'phone' => $row[8] ?? null,
                    'gis_location' => $row[9] ?? null,
                    'date_of_connection' => $row[10] ?? null,
                    'dtr_name' => $row[11] ?? null,
                    'dtr_code' => $row[12] ?? null,
                    'bill_grp' => $row[13] ?? null,
                    'category' => $row[14] ?? null,
                    'meter_no' => $row[15] ?? null,
                    'cd' => $row[16] ?? null,
                    'closing_balance' => $closingBalanceIdx !== null ? ($row[$closingBalanceIdx] ?? null) : null,
                    'cfy' => $cfyIdx !== null ? ($row[$cfyIdx] ?? null) : null,
                    'ecl_arrear' => $eclArrearIdx !== null ? ($row[$eclArrearIdx] ?? null) : null,
                ]
            );

            // Loop through columns to detect months
            foreach ($monthRow as $index => $monthLabel) {

                if (!$monthLabel) {
                    continue;
                }

                // Excel may store "Apr-24" as a date serial number — convert it back
                if (is_numeric($monthLabel)) {
                    try {
                        $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($monthLabel);
                        $monthLabel = $dateObj->format('M-y'); // e.g. "Apr-24"
                    } catch (\Exception $e) {
                        continue;
                    }
                }

                if (!preg_match('/^[A-Za-z]{3}-\d{2}$/', $monthLabel)) {
                    continue;
                }

                $monthParts = explode('-', $monthLabel);

                $billMonth = $monthParts[0];
                $billYear = '20' . $monthParts[1];

                ConsumerMonthlyBill::create([
                    'consumer_id' => $consumer->id,
                    'bill_month' => $billMonth,
                    'bill_year' => $billYear,
                    'opening_balance' => $row[$index] ?? null,
                    'bill_status' => $row[$index + 1] ?? null,
                    'meter_status' => $row[$index + 2] ?? null,
                    'billed_units' => $row[$index + 3] ?? null,
                    'billed_amount' => $row[$index + 4] ?? null,
                    'paid_amount' => $row[$index + 5] ?? null,
                ]);
            }
        }
    }


    public function chunkSize(): int
    {
        return 1000; // reads 1000 rows at a time
    }

    public function batchSize(): int
    {
        return 1000; // insert 1000 rows per query
    }
}