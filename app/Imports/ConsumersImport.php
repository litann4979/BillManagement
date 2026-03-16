<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Consumer;
use App\Models\ConsumerMonthlyBill;
use App\Models\ImportJob;
use App\Models\Section;
use App\Services\BillingService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ConsumersImport implements ToCollection, WithChunkReading, WithStartRow, ShouldQueue
{
    public int $timeout = 600;
    public int $tries = 3;

    protected int $billcollectorId;
    protected int $defaultSubdivisionId;

    /** @var array<string, int> column-name → column-index */
    protected array $headerMap;

    protected bool $isMatrixFormat;

    /** Matrix format: column-index → 'Y-m-d' date string */
    protected array $monthColumns;

    /** Columnar format: list of ['start' => int, 'date' => 'Y-m-d'] */
    protected array $columnarBlocks;

    /** Set by prepare(); used by the controller to create ImportJob */
    public int $totalRows = 0;

    /** Set by the controller after creating the ImportJob record */
    public int $importJobId = 0;

    public function __construct(
        int $billcollectorId,
        array $headerMap,
        bool $isMatrixFormat,
        array $monthColumns = [],
        array $columnarBlocks = [],
        int $defaultSubdivisionId = 1,
    ) {
        $this->billcollectorId = $billcollectorId;
        $this->headerMap = $headerMap;
        $this->isMatrixFormat = $isMatrixFormat;
        $this->monthColumns = $monthColumns;
        $this->columnarBlocks = $columnarBlocks;
        $this->defaultSubdivisionId = $defaultSubdivisionId;
    }

    /**
     * Pre-read the first two header rows from the Excel file and return a
     * fully configured import instance ready for Excel::queueImport().
     *
     * Usage (in controller):
     *   $path = $request->file('file')->store('imports');
     *   $import = ConsumersImport::prepare(Storage::path($path), $billcollectorId);
     *   Excel::queueImport($import, $path, 'local');
     */
    public static function prepare(string $absoluteFilePath, int $billcollectorId): self
    {
        $infoReader = new XlsxReader();
        $worksheetInfo = $infoReader->listWorksheetInfo($absoluteFilePath);
        $totalRows = max(0, ($worksheetInfo[0]['totalRows'] ?? 0) - 2);

        $reader = IOFactory::createReaderForFile($absoluteFilePath);
        $reader->setReadDataOnly(true);
        $reader->setReadFilter(new HeaderOnlyReadFilter());

        $spreadsheet = $reader->load($absoluteFilePath);
        $sheet = $spreadsheet->getActiveSheet();
        $highestCol = $sheet->getHighestColumn();

        $monthRowRaw = $sheet->rangeToArray("A1:{$highestCol}1", null, false, false)[0] ?? [];
        $headerRowRaw = $sheet->rangeToArray("A2:{$highestCol}2", null, false, false)[0] ?? [];

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $headerMap = self::buildHeaderMap($headerRowRaw);

        // Columnar format has an "opening balance" header; matrix does not.
        // Month values in row 1 can be either text ("Apr-24") or numeric
        // Excel serial dates (45383), so we must check parseMonthValue()
        // rather than just a regex.
        $hasOpeningBalance = isset($headerMap['opening_balance']);
        $hasMonthValues = collect($monthRowRaw)->contains(
            fn($v) => $v !== null && self::parseMonthValue($v) !== null
        );

        $isMatrixFormat = ! $hasOpeningBalance && $hasMonthValues;

        $monthColumns = [];
        $columnarBlocks = [];

        if ($isMatrixFormat) {
            $monthColumns = self::parseMatrixMonths($monthRowRaw);
        } elseif ($hasOpeningBalance) {
            $columnarBlocks = self::parseColumnarBlocks($monthRowRaw, $headerMap);
        }

        $defaultSubdivisionId = (int) config('billing.default_subdivision_id', 1);

        Log::info('ConsumersImport::prepare', [
            'format' => $isMatrixFormat ? 'matrix' : 'columnar',
            'billing_columns' => $isMatrixFormat ? count($monthColumns) : count($columnarBlocks),
            'total_rows' => $totalRows,
            'headers' => $headerMap,
        ]);

        $instance = new self(
            $billcollectorId,
            $headerMap,
            $isMatrixFormat,
            $monthColumns,
            $columnarBlocks,
            $defaultSubdivisionId,
        );

        $instance->totalRows = $totalRows;

        return $instance;
    }

    public function startRow(): int
    {
        return 3;
    }

    public function chunkSize(): int
    {
        return 1000;
    }

    // ─── Chunk entry point ──────────────────────────────────────────────

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            return;
        }

        $chunkSize = $rows->count();
        Log::info('ConsumersImport chunk started', ['rows' => $chunkSize]);

        $this->markProcessing();

        try {
            [$sectionMap, $subdivisionMap, $categoryMap] = $this->ensureLookupEntities($rows);

            DB::transaction(function () use ($rows, $sectionMap, $subdivisionMap, $categoryMap) {
                $this->upsertConsumersAndBills($rows, $sectionMap, $subdivisionMap, $categoryMap);
            });

            $this->recordChunkProgress($chunkSize);
        } catch (\Throwable $e) {
            $this->markFailed($e->getMessage());
            throw $e;
        }
    }

    private function markProcessing(): void
    {
        if (! $this->importJobId) {
            return;
        }

        ImportJob::where('id', $this->importJobId)
            ->where('status', 'queued')
            ->update(['status' => 'processing', 'started_at' => now()]);
    }

    private function recordChunkProgress(int $rowsProcessed): void
    {
        if (! $this->importJobId) {
            return;
        }

        ImportJob::where('id', $this->importJobId)->increment('processed_rows', $rowsProcessed);

        $job = ImportJob::find($this->importJobId);

        if ($job && $job->processed_rows >= $job->total_rows) {
            $job->update(['status' => 'completed', 'completed_at' => now()]);
        }
    }

    private function markFailed(string $message): void
    {
        if (! $this->importJobId) {
            return;
        }

        ImportJob::where('id', $this->importJobId)->update([
            'status' => 'failed',
            'error_message' => mb_substr($message, 0, 1000),
        ]);
    }

    // ─── Phase 1: auto-create missing lookup entities ───────────────────

    private function ensureLookupEntities(Collection $rows): array
    {
        $sectionMap = Section::pluck('id', 'name')
            ->mapWithKeys(fn($id, $name) => [strtolower(trim($name)) => $id])
            ->toArray();

        $subdivisionMap = Section::pluck('subdivision_id', 'id')->toArray();

        $categoryMap = Category::pluck('id', 'name')
            ->mapWithKeys(fn($id, $name) => [strtolower(trim($name)) => $id])
            ->toArray();

        $missingSections = [];
        $missingCategories = [];

        foreach ($rows as $row) {
            if (! $this->val($row, 'scno')) {
                continue;
            }

            $sectionRaw = trim((string) $this->val($row, 'section'));
            $sectionKey = strtolower($sectionRaw);
            if ($sectionRaw !== '' && ! isset($sectionMap[$sectionKey]) && ! isset($missingSections[$sectionKey])) {
                $missingSections[$sectionKey] = $sectionRaw;
            }

            $categoryRaw = trim((string) $this->val($row, 'category'));
            $categoryKey = strtolower($categoryRaw);
            if ($categoryRaw !== '' && ! isset($categoryMap[$categoryKey]) && ! isset($missingCategories[$categoryKey])) {
                $missingCategories[$categoryKey] = $categoryRaw;
            }
        }

        foreach ($missingSections as $key => $originalName) {
            try {
                $section = Section::firstOrCreate(
                    ['name' => $originalName],
                    ['subdivision_id' => $this->defaultSubdivisionId],
                );
            } catch (QueryException) {
                $section = Section::where('name', $originalName)->firstOrFail();
            }

            $sectionMap[$key] = $section->id;
            $subdivisionMap[$section->id] = $section->subdivision_id;
        }

        foreach ($missingCategories as $key => $originalName) {
            try {
                $category = Category::firstOrCreate(['name' => $originalName]);
            } catch (QueryException) {
                $category = Category::where('name', $originalName)->firstOrFail();
            }

            $categoryMap[$key] = $category->id;
        }

        if ($missingSections) {
            Log::info('Sections auto-created', ['names' => array_values($missingSections)]);
        }

        if ($missingCategories) {
            Log::info('Categories auto-created', ['names' => array_values($missingCategories)]);
        }

        return [$sectionMap, $subdivisionMap, $categoryMap];
    }

    // ─── Phase 2: upsert consumers + bills ──────────────────────────────

    private function upsertConsumersAndBills(
        Collection $rows,
        array $sectionMap,
        array $subdivisionMap,
        array $categoryMap,
    ): void {
        $now = now();
        $consumerRows = [];

        foreach ($rows as $row) {
            $scno = $this->val($row, 'scno');
            if (! $scno) {
                continue;
            }

            $sectionKey = strtolower(trim((string) $this->val($row, 'section')));
            $categoryKey = strtolower(trim((string) $this->val($row, 'category')));
            $sectionId = $sectionMap[$sectionKey] ?? null;

            $consumerRows[] = [
                'scno'             => (string) $scno,
                'billcollector_id' => $this->billcollectorId,
                'name'             => $this->val($row, 'name'),
                'section_id'       => $sectionId,
                'subdivision_id'   => $sectionId ? ($subdivisionMap[$sectionId] ?? null) : null,
                'category_id'      => $categoryMap[$categoryKey] ?? null,
                'village_id'       => null,
                'feeder_id'        => null,
                'dtr_id'           => null,
                'bill_grp'         => $this->val($row, 'bill_grp'),
                'created_at'       => $now,
                'updated_at'       => $now,
            ];
        }

        if (empty($consumerRows)) {
            return;
        }

        Consumer::upsert($consumerRows, ['scno'], [
            'billcollector_id', 'name', 'section_id',
            'subdivision_id', 'category_id', 'bill_grp', 'updated_at',
        ]);

        Log::info('Consumers upserted', ['count' => count($consumerRows)]);

        $scnos = array_column($consumerRows, 'scno');
        $consumerIdMap = Consumer::whereIn('scno', $scnos)
            ->pluck('id', 'scno')
            ->toArray();

        $billRows = [];

        foreach ($rows as $row) {
            $scno = (string) $this->val($row, 'scno');
            if (! $scno || ! isset($consumerIdMap[$scno])) {
                continue;
            }

            if ($this->isMatrixFormat) {
                $this->extractMatrixBills($row, $consumerIdMap[$scno], $billRows, $now);
            } else {
                $this->extractColumnarBills($row, $consumerIdMap[$scno], $billRows, $now);
            }
        }

        if (empty($billRows)) {
            return;
        }

        foreach (array_chunk($billRows, 1000) as $chunk) {
            ConsumerMonthlyBill::upsert($chunk, ['consumer_id', 'bill_period'], [
                'bill_month', 'bill_year', 'opening_balance', 'bill_status',
                'meter_status', 'billed_units', 'billed_amount', 'paid_amount', 'updated_at',
            ]);
        }

        $affectedIds = array_values(array_unique(array_column($billRows, 'consumer_id')));
        BillingService::bulkSyncAfterImport($affectedIds);

        Log::info('Bills upserted & synced', [
            'bills'     => count($billRows),
            'consumers' => count($affectedIds),
        ]);
    }

    // ─── Bill extraction: matrix format ─────────────────────────────────

    private function extractMatrixBills(Collection $row, int $consumerId, array &$billRows, $now): void
    {
        foreach ($this->monthColumns as $colIndex => $dateString) {
            $units  = $row[$colIndex] ?? null;
            $amount = $row[$colIndex + 1] ?? null;
            $paid   = $row[$colIndex + 2] ?? null;

            if ($units === null && $amount === null && $paid === null) {
                continue;
            }

            $billedAmt = is_numeric($amount) ? (float) $amount : 0;
            $paidAmt   = is_numeric($paid) ? (float) $paid : 0;
            $period    = Carbon::parse($dateString);

            $billRows[] = [
                'consumer_id'     => $consumerId,
                'bill_period'     => $dateString,
                'bill_month'      => $period->format('M'),
                'bill_year'       => (int) $period->format('Y'),
                'opening_balance' => null,
                'bill_status'     => BillingService::calculateBillStatus($billedAmt, $paidAmt),
                'meter_status'    => null,
                'billed_units'    => is_numeric($units) ? (int) $units : null,
                'billed_amount'   => $billedAmt,
                'paid_amount'     => $paidAmt,
                'created_at'      => $now,
                'updated_at'      => $now,
            ];
        }
    }

    // ─── Bill extraction: columnar format ───────────────────────────────

    private function extractColumnarBills(Collection $row, int $consumerId, array &$billRows, $now): void
    {
        foreach ($this->columnarBlocks as $block) {
            $s = $block['start'];
            $dateString = $block['date'];

            $opening     = $row[$s] ?? null;
            $billStatus  = $row[$s + 1] ?? null;
            $meterStatus = $row[$s + 2] ?? null;
            $units       = $row[$s + 3] ?? null;
            $amount      = $row[$s + 4] ?? null;
            $paid        = $row[$s + 5] ?? null;

            if ($units === null && $amount === null && $paid === null) {
                continue;
            }

            $billedAmt = is_numeric($amount) ? (float) $amount : 0;
            $paidAmt   = is_numeric($paid) ? (float) $paid : 0;
            $period    = Carbon::parse($dateString);

            $billRows[] = [
                'consumer_id'     => $consumerId,
                'bill_period'     => $dateString,
                'bill_month'      => $period->format('M'),
                'bill_year'       => (int) $period->format('Y'),
                'opening_balance' => is_numeric($opening) ? (float) $opening : null,
                'bill_status'     => BillingService::calculateBillStatus($billedAmt, $paidAmt),
                'meter_status'    => $meterStatus,
                'billed_units'    => is_numeric($units) ? (int) $units : null,
                'billed_amount'   => $billedAmt,
                'paid_amount'     => $paidAmt,
                'created_at'      => $now,
                'updated_at'      => $now,
            ];
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private function val(Collection $row, string $key): mixed
    {
        return isset($this->headerMap[$key]) ? ($row[$this->headerMap[$key]] ?? null) : null;
    }

    private static function buildHeaderMap(array $headerRow): array
    {
        $map = [];

        foreach ($headerRow as $i => $header) {
            $h = strtolower(trim((string) ($header ?? '')));
            if ($h === '') {
                continue;
            }

            if (str_contains($h, 'scno'))            $map['scno'] = $i;
            if ($h === 'name')                        $map['name'] = $i;
            if ($h === 'section')                     $map['section'] = $i;
            if (str_contains($h, 'bill_grp'))         $map['bill_grp'] = $i;
            if (str_contains($h, 'category'))         $map['category'] = $i;
            if (str_contains($h, 'opening balance'))  $map['opening_balance'] = $i;
        }

        return $map;
    }

    private static function parseMatrixMonths(array $monthRow): array
    {
        $columns = [];

        foreach ($monthRow as $i => $val) {
            if (! $val) {
                continue;
            }

            $dateString = self::parseMonthValue($val);
            if ($dateString) {
                $columns[$i] = $dateString;
            }
        }

        return $columns;
    }

    private static function parseColumnarBlocks(array $monthRow, array $headerMap): array
    {
        $start = $headerMap['opening_balance'] ?? null;
        if ($start === null) {
            return [];
        }

        $blocks = [];
        $maxCol = count($monthRow);
        $i = $start;

        while ($i + 5 < $maxCol) {
            $dateString = self::scanBackwardForMonth($monthRow, $i + 3);
            if ($dateString) {
                $blocks[] = ['start' => $i, 'date' => $dateString];
            }

            $i += 6;
        }

        return $blocks;
    }

    private static function scanBackwardForMonth(array $monthRow, int $fromIndex): ?string
    {
        for ($i = $fromIndex; $i >= 0; $i--) {
            $val = $monthRow[$i] ?? null;
            if (! $val) {
                continue;
            }

            return self::parseMonthValue($val);
        }

        return null;
    }

    private static function parseMonthValue(mixed $val): ?string
    {
        if (is_numeric($val)) {
            return Carbon::instance(Date::excelToDateTimeObject($val))
                ->startOfMonth()
                ->format('Y-m-d');
        }

        if (preg_match('/^[A-Za-z]{3}-\d{2}$/', (string) $val)) {
            [$month, $year] = explode('-', (string) $val);

            return Carbon::createFromFormat('M Y', $month . ' 20' . $year)
                ->startOfMonth()
                ->format('Y-m-d');
        }

        return null;
    }
}
