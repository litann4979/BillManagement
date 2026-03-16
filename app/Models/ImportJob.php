<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    protected $fillable = [
        'file_name',
        'total_rows',
        'processed_rows',
        'status',
        'error_message',
        'created_by',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'processed_rows' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function progressPercentage(): int
    {
        if ($this->total_rows <= 0) {
            return 0;
        }

        return min(100, (int) round(($this->processed_rows / $this->total_rows) * 100));
    }
}
