<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumerArrear extends Model
{
    protected $fillable = [
        'consumer_id',
        'months_due',
        'total_arrear',
        'last_bill_period',
    ];

    protected $casts = [
        'months_due' => 'integer',
        'total_arrear' => 'decimal:2',
        'last_bill_period' => 'date',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }
}
