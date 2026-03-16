<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Defaulter extends Model
{
    protected $fillable = [
        'consumer_id',
        'bill_period',
        'amount_due',
        'status'
    ];

    protected $casts = [
        'bill_period' => 'date',
        'amount_due' => 'decimal:2'
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }
}