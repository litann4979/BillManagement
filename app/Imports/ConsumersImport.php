<?php

namespace App\Imports;

use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;

class ConsumersImport implements ToCollection, WithChunkReading, WithStartRow, ShouldQueue
{
    protected $billcollectorId;

    // store headers
    protected static $monthRow = null;
    protected static $columnRow = null;

    public function __construct($billcollectorId = null)
    {
        $this->billcollectorId = $billcollectorId;
    }

    /*
    |--------------------------------------------------------------------------
    | Skip first 2 rows (headers)
    |--------------------------------------------------------------------------
    */

    public function startRow(): int
    {
        return 1;
    }

    public function collection(Collection $rows)
    {
        // first chunk stores headers
        if (self::$monthRow === null) {
            self::$monthRow = $rows[0];
            self::$columnRow = $rows[1];
            $rows = $rows->slice(2);
        }

        $consumerRows = [];
        $billRows = [];
        $now = now();

        foreach ($rows as $row) {

            $scno = $row[1] ?? null;

            if (!$scno) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Consumer Data
            |--------------------------------------------------------------------------
            */

            $consumerRows[] = [

                'scno' => $scno,
                'billcollector_id' => $this->billcollectorId,

                'subdivision' => $row[0] ?? null,
                'section' => $row[0] ?? null,
                'name' => $row[2] ?? null,

                'bill_grp' => $row[3] ?? null,
                'category' => $row[4] ?? null,

                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Upsert Consumers
        |--------------------------------------------------------------------------
        */

        if (!empty($consumerRows)) {

            Consumer::upsert(
                $consumerRows,
                ['scno'],
                ['billcollector_id','subdivision','section','name','bill_grp','category','updated_at']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch Consumer IDs
        |--------------------------------------------------------------------------
        */

        $scnos = array_column($consumerRows, 'scno');

        $consumerMap = Consumer::whereIn('scno', $scnos)
            ->pluck('id','scno')
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | Process Monthly Bills
        |--------------------------------------------------------------------------
        */

        foreach ($rows as $row) {

            $scno = $row[1] ?? null;

            if (!$scno || !isset($consumerMap[$scno])) {
                continue;
            }

            $consumerId = $consumerMap[$scno];

            foreach (self::$monthRow as $index => $monthLabel) {

                if (!$monthLabel) continue;

                if (is_numeric($monthLabel)) {
                    $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($monthLabel);
                    $monthLabel = $dateObj->format('M-y');
                }

                if (!preg_match('/^[A-Za-z]{3}-\d{2}$/', $monthLabel)) {
                    continue;
                }

                [$month,$year] = explode('-', $monthLabel);

                $billedUnits = null;
                $billedAmount = null;
                $paidAmount = null;

                for ($i=0;$i<3;$i++) {

                    $header = strtolower(trim(self::$columnRow[$index+$i] ?? ''));

                    $value = $row[$index+$i] ?? null;

                    if (str_contains($header,'billed')) {

                        if (str_contains($header,'unit')) {
                            $billedUnits = is_numeric($value) ? $value : null;
                        }

                        if (str_contains($header,'amount')) {
                            $billedAmount = is_numeric($value) ? $value : null;
                        }
                    }

                    if (str_contains($header,'paid')) {
                        $paidAmount = is_numeric($value) ? $value : null;
                    }
                }

                $billRows[] = [

                    'consumer_id' => $consumerId,
                    'bill_month' => $month,
                    'bill_year' => '20'.$year,

                    'billed_units' => $billedUnits,
                    'billed_amount' => $billedAmount,
                    'paid_amount' => $paidAmount,

                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Insert Bills in Batches
        |--------------------------------------------------------------------------
        */

        if (!empty($billRows)) {

            foreach (array_chunk($billRows,1000) as $chunk) {
                ConsumerMonthlyBill::insert($chunk);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Chunk Size
    |--------------------------------------------------------------------------
    */

    public function chunkSize(): int
    {
        return 1000;
    }
}