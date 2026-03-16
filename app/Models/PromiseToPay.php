<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromiseToPay extends Model
{
    protected $fillable = [
        'consumer_id',
        'promised_amount',
        'promise_date',
        'remarks',
        'status',
        'created_by',
    ];

    protected $casts = [
        'promised_amount' => 'decimal:2',
        'promise_date' => 'date',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
