<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'consumer_id',
        'bill_id',
        'payment_amount',
        'payment_mode',
        'receipt_no',
        'payment_date',
        'collected_by',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function bill()
    {
        return $this->belongsTo(ConsumerMonthlyBill::class, 'bill_id');
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }
}
