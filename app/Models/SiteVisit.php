<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteVisit extends Model
{
    protected $fillable = [
        'consumer_id',
        'email_collected',
        'phone_collected',
        'meter_bypass_photo',
        'evidence_video',
        'latitude',
        'longitude',
        'action_taken',
        'status',
        'captured_by',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'captured_by');
    }
}
