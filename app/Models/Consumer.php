<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consumer extends Model
{
    protected $fillable = [

        'billcollector_id',

        'subdivision',
        'section',

        'scno',
        'name',

        'address_1',
        'address_2',
        'address_3',

        'email',
        'phone',

        'gis_location',

        'date_of_connection',

        'dtr_name',
        'dtr_code',

        'bill_grp',
        'category',

        'meter_no',
        'cd',

        'closing_balance',
        'cfy',
        'ecl_arrear'
    ];

    protected $casts = [
        'date_of_connection' => 'date',
        'cd' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'cfy' => 'decimal:2',
        'ecl_arrear' => 'decimal:2'
    ];

    /**
     * Consumer belongs to Bill Collector
     */
    public function billcollector()
    {
        return $this->belongsTo(User::class, 'billcollector_id');
    }

    /**
     * Consumer has many monthly bills
     */
    public function monthlyBills()
    {
        return $this->hasMany(ConsumerMonthlyBill::class);
    }
}