<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumerMonthlyBill extends Model
{
    protected $fillable = [

        'consumer_id',

        'bill_month',
        'bill_year',

        'opening_balance',

        'bill_status',
        'meter_status',

        'billed_units',

        'billed_amount',

        'paid_amount',
        'bill_period',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'billed_units' => 'integer',
        'billed_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'bill_period' => 'date',
    ];

    /**
     * Bill belongs to consumer
     */
    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function payments()
{
    return $this->hasMany(Payment::class,'bill_id');
}
}