<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnauthorizedConnection extends Model
{
    protected $fillable = [
        'name',
        'address',
        'aadhaar_number',
        'aadhaar_photo',
        'latitude',
        'longitude',
        'evidence_photo',
        'evidence_video',
        'reported_by',
        'status',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
