<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consumer extends Model
{
    protected $fillable = [

        'billcollector_id',

        'subdivision_id',
        'section_id',
        'village_id',
        'feeder_id',
        'dtr_id',
        'category_id',

        'scno',
        'name',

        'address_1',
        'address_2',
        'address_3',

        'email',
        'phone',

        'gis_location',
        'latitude',
        'longitude',

        'date_of_connection',

        'bill_grp',

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
        'ecl_arrear' => 'decimal:2',

        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7'
    ];

    /**
     * Consumer belongs to Bill Collector
     */
    public function billcollector()
    {
        return $this->belongsTo(User::class, 'billcollector_id');
    }

    /**
     * Subdivision relationship
     */
    public function subdivision()
    {
        return $this->belongsTo(Subdivision::class);
    }

    /**
     * Section relationship
     */
    public function sectionRelation()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    /**
     * Village relationship
     */
    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    /**
     * Feeder relationship
     */
    public function feeder()
    {
        return $this->belongsTo(Feeder::class);
    }

    /**
     * DTR relationship
     */
    public function dtr()
    {
        return $this->belongsTo(Dtr::class);
    }

    /**
     * Category relationship
     */
    public function categoryRelation()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Consumer has many monthly bills
     */
    public function monthlyBills()
    {
        return $this->hasMany(ConsumerMonthlyBill::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function flags()
    {
        return $this->hasMany(ConsumerFlag::class);
    }

    public function visits()
    {
        return $this->hasMany(VisitLog::class);
    }

    public function promises()
    {
        return $this->hasMany(PromiseToPay::class);
    }

    public function defaulters()
    {
        return $this->hasMany(Defaulter::class);
    }

    public function arrear()
    {
        return $this->hasOne(ConsumerArrear::class);
    }
}