<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectorGpsLog extends Model
{
    protected $fillable = ['user_id', 'latitude', 'longitude', 'recorded_at'];

    protected $casts = [
        'recorded_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
